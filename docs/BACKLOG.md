# Backlog

Record useful but out-of-scope findings here. Do not silently expand prompt scope.

## Discovered during Prompt 002 (foundation)

- **Prisma 7 config migration.** We pinned Prisma to v6 for compatibility. Before
  adopting v7, plan the migration to `prisma.config.ts` + a driver adapter
  (`@prisma/adapter-pg`) and update the kit's later domain/migration prompts.
- **Homebrew not installable non-interactively.** Node was installed to
  `~/.local/node` without sudo. For a reproducible team setup, document a
  standard install (Homebrew or nvm) and consider committing `.tool-versions`.
- **Playwright browsers not installed.** CI/dev must run `npx playwright install`
  before e2e. Add this to the CI e2e job when e2e is wired into the pipeline.
- **npm 11 blocks install scripts by default.** Approved packages are pinned in
  `package.json` `allowScripts` (esbuild, sharp, unrs-resolver, prisma engines).
  Revisit these entries on any major dependency bump.
- **Baseline docs from kit Prompt 001 not yet created.** `docs/MVP_SCOPE.md` and
  `docs/TECHNICAL_DECISIONS.md` are referenced by later prompts but do not exist.
  Create them when rejoining the kit sequence.
- **Kit prompt numbering divergence.** The custom Prompt 002 overlaps kit steps
  004–008 and 022–024. When rejoining, skip those to avoid duplicate work.

## Discovered during the Prompt 002 foundation review

- **Standalone output deferred.** `output: "standalone"` was removed because it
  breaks `next start` and added premature complexity. The Dockerfile now uses the
  conventional production server. Reintroduce standalone later (with a tested
  `node .next/standalone/server.js` runner) if smaller images are needed.
- **e2e in CI.** A Playwright job was added to `.github/workflows/ci.yml`. Add a
  PostgreSQL service to that job once routes depend on the database.

## Discovered during Prompt 003 (domain foundation)

- **Rubric weight normalization decision.** Weights are currently "positive,
  weighted average." Decide with product whether rubrics must sum to 100% and, if
  so, enforce it in `createRubric`.
- **Project rich metadata.** If/when invariants are needed on client, objectives,
  audience, platform, or runtime target, model them as value objects; today only
  identity/name/status/owner are enforced.

## Discovered during Prompt 004 (application layer)

- **Slug uniqueness must be enforced at the database.** `createContentItem` checks
  then saves; the persistence adapter must add a unique constraint so concurrent
  creates cannot both succeed.
- **Optimistic concurrency for load-modify-save.** DONE in Prompt 005 — a
  provider-neutral `lockVersion` compare-and-swap in the persistence layer (no
  Prisma row versions leak upward). Remaining delivery-layer work tracked below.
- **Content/rubric authoring authorization.** Introduce an author/role concept so
  authoring use cases can enforce permission (currently deferred, not enforced).
- **Delivery-layer idempotency.** Add idempotency keys at the transport layer for
  retryable operations (project/content/evaluation creation).

## Discovered during Prompt 005 (persistence layer)

- **Delivery-layer concurrency version round-trip.** Optimistic concurrency is
  implemented at the persistence layer (`lockVersion` + CAS). When the delivery
  layer is built, expose the version to clients and require it on submit so a stale
  browser write is rejected with a 409, not silently re-read.
- **Authentication-backed identity tables.** Replace the external `OwnerId`
  reference with a real users table (and FK) once authentication exists.
- **Cross-repository transactions.** If a future workflow must save multiple
  aggregates atomically, introduce an explicit application transaction port
  (not a generic unit-of-work) for exactly that workflow.
- **Production connection pooling.** Decide pooling/serverless strategy (e.g.
  PgBouncer or Prisma driver adapters) before production deployment.
- **Migration rehearsal automation.** Automate applying migrations against a copy
  of production state and document operational rollback (Prisma emits no down
  migrations; recovery is restore-from-backup today).
- **CI PostgreSQL.** Wire integration tests into CI with a PostgreSQL service or
  the embedded-postgres approach used locally.

## Discovered during Prompt 006A (HTTP delivery layer)

- **Replace the temporary actor adapter** with authenticated identity (Prompt 006B),
  add 401 for unauthenticated requests, and add CSRF protection for the chosen auth.
- **Concurrency version round-trip to clients** is now live via ETag/If-Match; ensure
  the future UI/mobile client sends `If-Match` on mutations.
- **Rate limiting** once the API is externally exposed.
- **Idempotency keys** for create/command endpoints once external clients or webhooks
  exist (optimistic concurrency is not idempotency).
- **CI API integration tests**: run `npm run test:api` (embedded PostgreSQL) and
  `npm run openapi:validate` in CI.
- **API client generation** from the OpenAPI spec if a typed client is justified.
- **Pagination** for list endpoints when collections can grow unbounded.

## Discovered during Prompt 006B (authentication)

- **Live Supabase verification (BLOCKING for public production).** Exercise OTP
  delivery, verify/refresh/revocation, cookie exchange, and JWKS verification against
  an isolated throwaway project (procedure in `docs/AUTHENTICATION_ARCHITECTURE.md`).
- **OTP abuse rate limiting (BLOCKING before public OTP exposure).** Add durable
  per-IP/per-identifier limits (not in-memory); provider-native limits cover the MVP
  only.
- **Login / account-management / recovery UI.** No user-facing auth UI exists yet.
- **Mobile bearer flow.** Native/hybrid client using the bearer path end-to-end.
- **Server-side session refresh** (endpoint or middleware) so the browser need not
  re-verify on access-token expiry.
- **Security audit log** (sign-in, provisioning, disable, authorization denial, final
  human decision).
- **Roles / memberships / invitations / organizations** on the stable identity base.
- **Provider webhooks** (user deletion, email change, disable, revocation) if a
  reconciliation correctness need appears.
- **Row-Level Security** — adopt if untrusted direct DB access, multi-tenant isolation,
  or Supabase client-side data access is introduced.
- **User deletion/anonymization** policy (disable-only today; no cascade of business
  records).
- **CI**: run `npm run test:auth` alongside `test:api`/`openapi:validate`.

## Discovered during Milestone 2 (decision workspace)

- **Real AI recommender adapter.** The `AiRecommender` domain port still has no
  provider implementation, so the decision workspace attaches the AI advisory via
  manual entry (the existing `/api/v1/decisions/{id}/advisory` endpoint). Wiring a
  real AI engine needs a provider API key (a STOP-condition secret) and is out of
  Milestone 2 scope — deferred. The human-decision path is already authoritative
  and unaffected.
