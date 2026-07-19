# Known Limitations

Honest inventory of what the foundation does **not** yet do, and constraints a
new engineer should know. Captured after Prompt 002 and the Gate 1 review. None
of these are defects in the foundation's scope; they are deliberate boundaries or
tracked follow-ups. Operational follow-ups also live in `docs/BACKLOG.md`.

## Product capability not yet built (by design)

The foundation intentionally contains **no business functionality**. Absent:

- Authentication and session management.
- Authorization (server-side workspace/role checks). The `src/server` boundary is
  reserved and documented, but empty. **Do not build data access without it.**
- Database models and migrations (`prisma/schema.prisma` has no models;
  `DATABASE_URL` is optional until models exist).
- AI providers/engines, uploads, transcripts, evidence, decisions, dashboards,
  and API endpoints.

These arrive in later build steps and must not be assumed present.

## Domain foundation (Prompt 003) — what exists vs. not

The pure **domain model** now exists for Project, Content (knowledge base),
Evaluation (Rubric + Evaluation), Decision, and AI, with typed identifiers, value
objects, invariants, lifecycle transitions, typed errors, and repository/port
**contracts**. What is deliberately **not** modeled yet:

- **Media assets & transcripts.** "Content" here is the knowledge base, not
  footage/interviews. Media ingest, storage, and transcription are a separate,
  deferred domain (see reconciliation in ADR-0014).
- **Content relations graph, decision trees, Creative Council orchestration,
  project stages, and the learning engine** — later steps.
- **Rich Project metadata** (client, objectives, platform, runtime target) — held
  off until a use case enforces invariants on it; only identity/name/status/owner
  are modeled now.
- **Persistence adapters** for the repository contracts — interfaces only; no
  Prisma models or implementations.
- **Rubric weight normalization** is "positive weights, weighted average," not a
  mandated sum-to-100%; revisit if the product requires it.

## Application layer (Prompt 004) — what exists vs. not

Framework-independent MVP use cases now orchestrate the domain (project, content,
evaluation, decision, AI), tested in memory. Genuine current limitations:

- **No persistence-level transaction guarantees.** `createContentItem` checks slug
  uniqueness then saves; atomicity depends on a future DB unique constraint.
  Load-modify-save flows need isolation the in-memory adapters cannot prove.
- **Concurrency (optimistic/expected-version) deferred** to the persistence phase;
  no version metadata is modeled yet.
- **Delivery-layer idempotency deferred.** Duplicate-submission protection for
  retrying transports is future work; domain invariants cover deciding-twice.
- **Authentication and full authorization deferred.** Ownership is enforced for
  project-owned resources; **content and rubric authoring authorization is not
  enforced** (no owner/role/author concept yet). `requestRecommendation` auth is
  also deferred.
- **No AI provider adapters.** The `AiRecommender` port has an in-memory test
  double only; real provider adapters are a later step. (Repository adapters now
  exist — see the persistence section below.)

## Persistence layer (Prompt 005) — what exists vs. not

Real Prisma/PostgreSQL repository adapters now implement the domain contracts,
verified against a real database (integration tests). Genuine remaining limits:

- **Optimistic concurrency is implemented** for mutable aggregates (Project,
  Content, Decision) via a `lockVersion` compare-and-swap; append-only aggregates
  (Rubric, Evaluation) have none by design. The version token is carried on the
  loaded aggregate; when the delivery layer arrives it must round-trip the expected
  version through the client so a stale submit from a browser is also rejected.
- **No users/identity table.** `OwnerId` is stored as an external reference; no
  fake users table was added while authentication is deferred.
- **No cross-repository transaction abstraction.** Each aggregate saves atomically
  on its own; no current workflow needs multi-aggregate atomicity.
- **CHECK-constraint migrations are invisible to `prisma migrate dev` drift
  detection.** The project authors schema via `migrate deploy`, so this is not on
  the deploy path, but `migrate dev` should not be used to author further changes
  without accounting for it.
- **Connection pooling is not configured** (a single long-lived client is assumed);
  serverless deployment needs review.
- **Integration PostgreSQL is provided by `embedded-postgres`** (real PG 17 in
  userspace) because Docker is unavailable in this environment; CI should use a
  PostgreSQL service or the same embedded approach.

## Platform / tooling constraints

- **Prisma pinned to v6.** Prisma 7 (config file + driver adapter) is not adopted;
  migrating is a tracked task. See ADR-0008.
- **Local Node via `~/.local/node`.** Non-standard install (Homebrew needed an
  interactive admin password). Standardize with Homebrew/nvm/`.tool-versions`
  before team onboarding. See ADR-0013.
- **npm 11 install-script allowlist.** `package.json` `allowScripts` pins approved
  packages (esbuild, sharp, unrs-resolver, prisma engines, fsevents). Revisit on
  major dependency bumps.
- **Playwright browsers are not bundled.** Run `npx playwright install` (CI does
  this in the e2e job).

## CI/CD gaps

- No PostgreSQL service in the e2e job yet (no DB-backed routes exist). Add when
  routes read data.
- No dependency-audit gate (`npm audit`/Dependabot) — deferred to avoid flaky
  failures on transitive advisories; add a scheduled audit before beta.
- No Playwright browser caching in CI (minor speed cost).

## Quality gaps (foundation-appropriate, tracked)

- **No coverage thresholds.** 51 unit + 2 e2e tests exist, but no enforced
  minimum. Add thresholds as the codebase grows.
- **No automated accessibility testing.** Manual a11y foundations are in place
  (focus-visible, skip link, ARIA labels, `color-scheme`); add `axe`-based checks
  when interactive features land.
- **No bundle-size budget or DB query profiling.** Not meaningful until real
  features/data exist.

## Design system limitations

- **Dark-first only; no runtime theme toggle.** Tokens support `.light`, but there
  is no persisted theme provider/toggle yet. See ADR-0005.
- **Spacing uses Tailwind's default scale** rather than bespoke spacing tokens.
  Acceptable in Tailwind v4 (the scale *is* the token system); revisit only if
  brand spacing diverges.
- **Single shadcn/ui primitive so far** (`Button`). The component library grows in
  later steps; conventions (`components.json`, `cn`) are in place.

## Documentation gaps

- No `SECURITY.md` or `CONTRIBUTING.md` yet — recommended before external
  contributors. (`ARCHITECTURAL_DECISIONS.md` and this file now exist.)

## Process / repository notes

- **Kit prompt-numbering divergence.** The custom Prompt 002 bundled what the kit
  splits across steps 004–008 and 022–024; skip those when rejoining the sequence.
- **`public/` is empty** (default Next assets removed); the favicon lives in
  `src/app`. Add real assets when branding is defined.
- **`.prettierignore` excludes markdown and `prompts/`** so the kit's authored
  content is never reformatted; docs are therefore not format-checked.
