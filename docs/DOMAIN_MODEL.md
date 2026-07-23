# Domain Model (MVP)

The domain layer holds pure business logic: identities, value objects, aggregates,
invariants, typed errors, and the repository/port **contracts** that keep
infrastructure outside. It imports no framework, database, provider, UI, env, or
logging code (enforced by ESLint).

## Domain map

```
src/domain/
  shared/       cross-cutting value primitives (ids, confidence, score, slug, text,
                errors, state-machine helper) — no domain concepts of its own
  project/      Project aggregate + lifecycle
  content/      ContentItem (knowledge base) aggregate + lifecycle + versioning
  evaluation/   Rubric aggregate + Evaluation aggregate (rubric-based scoring)
  decision/     Decision aggregate (human authority over AI advice)
  ai/           provider-neutral AiRecommendation value + AiRecommender port
```

Dependency direction: `project | content | evaluation | decision | ai → shared`.
Domains do **not** import each other; cross-domain references are by **identifier
only** (e.g. an `Evaluation` holds a `ProjectId`, never a `Project`).

## Bounded contexts and responsibilities

| Domain | Real business capability | Owns |
|--------|--------------------------|------|
| **Project** | A unit of creative work with a lifecycle | Project identity, name, owner reference, status transitions |
| **Content** | The reusable **knowledge base** (principles, tools, rubrics, playbooks, …) | ContentItem identity, type, slug, title, publication status, version |
| **Evaluation** | Structured, rubric-based scoring of work | Rubric + weighted criteria; Evaluation with per-criterion scores + required justification |
| **Decision** | Recording creative decisions where a **human holds final authority** | Options, optional AI advisory, human selection + rationale, status |
| **AI** | Provider-neutral shape of AI advice | `AiRecommendation` value (observations/inferences/unknowns/options/recommendation), `AiRecommender` port |

### Naming reconciliation (surfaced per prompt §2)
The prompt's *Content* description leans toward "media assets." The repository's
`schemas/domain-model.md` defines `ContentItem` as the **knowledge base**, and
media/transcripts are a distinct later build step. Repository authority wins:
**Content = knowledge base**. Media assets are deferred (see Known Limitations).
This is a documented resolution, not a silent choice, and does not require owner
approval because it follows the stated authority order.

## Aggregates, identity, invariants, transitions

### Project (aggregate root)
- **Identity:** `ProjectId` (prefix `proj`). References `OwnerId` (external user domain).
- **Value objects:** `ProjectName` (1–200 chars, trimmed).
- **Status:** `DRAFT → ACTIVE → COMPLETED → ARCHIVED`; archive allowed from
  DRAFT/ACTIVE/COMPLETED; `ARCHIVED` terminal. No reopen in MVP.
- **Invariants:** always has a valid id, owner, name; `updatedAt ≥ createdAt`;
  status changes only via legal transitions.

### ContentItem (aggregate root)
- **Identity:** `ContentItemId` (prefix `cnt`).
- **Value objects:** `Slug`, `ContentTitle` (1–200), `ContentType` (enum of 11 types).
- **Status:** `DRAFT ⇄ PUBLISHED → ARCHIVED`; `ARCHIVED` terminal.
- **Versioning:** `version` starts at 1; `revise()` increments it and returns the
  item to `DRAFT` (a new revision must be re-published). Strictly increasing.
- **Invariants:** valid slug/title/type; `version ≥ 1` and monotonic; legal transitions only.

### Rubric (aggregate root) + RubricCriterion (owned)
- **Identity:** `RubricId` (prefix `rbr`), `CriterionId` (prefix `crit`).
- **Invariants:** ≥1 criterion; each criterion `weight > 0`; criterion ids unique.
- **Behavior:** `weightedScore(scoresByCriterion)` — pure weighted average on a 1–10
  scale; requires a score for every criterion.

### Evaluation (aggregate root) + CriterionScore (owned value)
- **Identity:** `EvaluationId` (prefix `eval`). References `ProjectId`, `RubricId`.
- **Value objects:** `Score` (integer 1–10), justification (required, 1–2000 chars),
  `ReviewerType` (`HUMAN | AI`).
- **Invariants:** ≥1 score; no duplicate `CriterionId`; every score has a
  non-empty justification (PRD: "written justification required"). Immutable once created.

### Decision (aggregate root)
- **Identity:** `DecisionId` (prefix `dec`). References `ProjectId`.
- **Concepts:** `DecisionOption` (id + label + rationale); optional `Advisory`
  (AI-advised option id + `Confidence` + rationale — **advisory only**).
- **Status:** `PROPOSED → DECIDED`.
- **Human-authority invariant (core product principle):** a Decision cannot become
  `DECIDED` without a human `selectedOptionId` **and** a `decidedBy` owner. AI
  advisory can never set the final selection or move the status by itself. The
  selected option must be one of the decision's options.

### AI
- `AiRecommendation` **value object**: separates `observations`, `inferences`
  (each with `Confidence`), `unknowns`, `options` (benefits/tradeoffs/risks), and a
  `recommendation` (selected option + reasoning + `Confidence`). Enforces the
  product principle of separating observation / inference / unknown.
- `AiRecommender` **port**: `recommend(input) → Promise<Result<AiRecommendation, AiError>>`.
  Providers implement this **outside** the domain; no SDK types cross the boundary.

## Contracts (ports)

Narrow, intent-revealing, no CRUD/BaseRepository, no Prisma/query types:

- `ProjectRepository`: `findById`, `save`, `listByOwner`
- `ContentRepository`: `findById`, `findBySlug`, `existsBySlug`, `save`
- `RubricRepository`: `findById`, `save`
- `EvaluationRepository`: `findById`, `listByProject`, `save`
- `DecisionRepository`: `findById`, `listByProject`, `save`
- `AiRecommender` (port): `recommend`

Reads return the aggregate or `null` (absence is normal); `save` returns
`Promise<void>`. Infrastructure failures surface as thrown `AppError`s from adapters
(built later); expected domain failures use typed `Result` + `DomainError`.

### Contract → MVP workflow justification

Every contract (and each method) is tied to at least one documented MVP workflow
from `docs/PRODUCT_REQUIREMENTS.md`. Nothing speculative is retained.

| Contract · method | Justifying MVP workflow |
|-------------------|-------------------------|
| `ProjectRepository.listByOwner` | Dashboard → "Recent projects" |
| `ProjectRepository.save` | Dashboard → "Start new project"; project metadata edits |
| `ProjectRepository.findById` | Open a project workspace |
| `ContentRepository.findBySlug` | Knowledge base → open an item by slug |
| `ContentRepository.findById` | Knowledge base → related/backlinked item lookup |
| `ContentRepository.existsBySlug` | Knowledge base authoring → enforce unique slug |
| `ContentRepository.save` | Knowledge base authoring / versioning |
| `RubricRepository.findById` | Rubrics → load a rubric to score against |
| `RubricRepository.save` | Rubrics → author/define a rubric |
| `EvaluationRepository.save` | Rubrics → record a scored review |
| `EvaluationRepository.listByProject` | Rubrics → "project score history" / reviewer comparison |
| `EvaluationRepository.findById` | Rubrics → view a single evaluation |
| `DecisionRepository.save` | Project stage → record the "human decision" |
| `DecisionRepository.listByProject` | Project decision log |
| `DecisionRepository.findById` | Open/review a single decision |
| `AiRecommender.recommend` | Creative GPS routing; per-stage "AI action" |

## Time and identity (determinism)
Aggregate `create`/transition functions accept an injected `now: Date`. Identifiers
are **generated at the application boundary** using `@/lib/id` (`createId({prefix})`)
and validated by each id type's `parse`; the domain never calls the clock or RNG,
so domain tests are deterministic.

## Domain events
**None introduced.** No consumer or workflow justifies one yet (no queue, outbox,
or projection exists). Adding an event bus now would be speculative. Revisit when a
concrete asynchronous workflow appears. (Documented per prompt §6.8.)

## Cross-domain references
By identifier only. Mapping an `AiRecommendation` (AI domain) into a Decision
`Advisory` is an **application-layer** concern, so `decision` does not import `ai`.

## Media and Transcript context (Prompt 011)

`MediaAsset` is immutable project-owned metadata; it does not contain file bytes or
storage-provider details. `TranscriptDocument` is an immutable aggregate associated
with exactly one media asset. It owns transcript-local `TranscriptSpeaker` values and
an ordered, non-empty collection of `TranscriptSegment` values. Segment identifiers
and sequence numbers are unique within the transcript. A speaker reference cannot
cross a transcript boundary, and timestamps are either both absent or a non-negative
pair with `endMs > startMs`.

This context references Project only by `ProjectId` and ownership by `OwnerId`.
Registration and transcript creation enforce ownership and project/media alignment
in the application layer; persistence repeats that alignment with composite foreign
keys. It is intentionally separate from Knowledge Acquisition: later import work may
translate a transcript into acquisition inputs without coupling these aggregates.
In particular, a Knowledge Acquisition `SourceDocument` is an ingestion provenance
record under a `KnowledgeSource`; it is neither media metadata nor the normalized
transcript aggregate. Prompt 011 creates no cross-domain link or automatic conversion.

## Evidence context (Prompt 012)

`EvidenceReference` is an immutable project-owned source pointer. Its discriminated
`EvidenceProvenance` is either `MEDIA_ASSET` (the whole registered asset) or
`TRANSCRIPT_SEGMENT` (one exact segment plus its transcript and originating media
asset). Transcript provenance deliberately retains the complete chain so later
consumers can resolve the evidence without reconstructing or guessing its source.

Evidence is a distinct bounded context. It references Media and Transcript identifiers
only; it does not modify those aggregates and does not link to Knowledge Acquisition.
`StoryEvidence`, Decision advisory evidence, and Knowledge Observation provenance keep
their existing domain-specific meanings. Bookmarking workflows, citation presentation,
analysis grounding, and evidence-to-analysis relationships are deferred to their
numbered roadmap prompts.

## Intentionally excluded (this step)
Persistence/adapters, Prisma models, migrations, API/UI, auth/authz, media assets &
transcripts, content relations graph, decision trees, Creative Council orchestration,
project stages, learning engine, AI provider adapters, prompt templates. These are
later build steps; see `docs/KNOWN_LIMITATIONS.md` and `docs/BACKLOG.md`.

## Open questions (deferred, non-blocking)
- Whether `Project` should carry rich metadata (client, objectives, platform) as
  value objects or as an application-level profile — deferred until a use case
  enforces invariants on them.
- Exact rubric weight normalization (sum-to-1 vs arbitrary positive) — modeled as
  "positive weights, weighted average" now; revisit if the product mandates 100%.

## Technical-debt posture and validation assumptions

Rather than an absolute "no technical debt," the precise position is:

- **No known implementation debt was intentionally introduced** — no dead code,
  TODOs, `any`, unsafe assertions, silent error swallowing, generic CRUD, or
  speculative abstractions.
- **The initial domain model encodes validation assumptions that must be tested
  through real application use cases.** Unit tests prove the invariants as
  currently specified; they cannot prove the specification is complete until
  application-layer workflows and persistence adapters exercise it.

### Current model assumptions (non-blocking)

These are deliberate starting points, not defects. Each is expected to be
confirmed — or revised — once real workflows exist:

1. **Content = knowledge base**, not uploaded media assets. Media/transcripts are
   a separate, deferred domain.
2. **Cross-domain references use branded identifiers via type-only imports**, so
   domains stay runtime-decoupled and acyclic.
3. **Rubric-weight normalization semantics remain intentionally undecided**
   (currently positive weights + weighted average).
4. **Aggregate and repository contracts have not yet been validated through
   application-layer workflows or persistence adapters** — only through unit tests.
5. **Lifecycle models may evolve** when real workflows expose additional
   invariants or states not yet required by the MVP.

**Status:** all five are **non-blocking assumptions**, not immediate defects. They
are tracked here and in `docs/KNOWN_LIMITATIONS.md` and are safe to carry into
feature development.
