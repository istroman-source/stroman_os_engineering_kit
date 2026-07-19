# API Architecture (Prompt 006A)

The HTTP layer is a thin, versioned **delivery adapter** over the application use
cases. It parses and validates requests, calls exactly one use case, serializes
outputs, maps typed failures to stable responses, and round-trips concurrency
tokens. It contains no business logic and no persistence access.

## Dependency direction

```
Next.js Route Handler (src/app/api/**)
  → src/server/http (validation, serialization, error mapping, actor, ETag)
  → src/server/composition (wires adapters to use cases)
  → application use case → domain / persistence port
```

Routes never import Prisma or `@/infrastructure` (ESLint-enforced); persistence is
reached only through `src/server/composition`.

## Route inventory (v1)

- Projects: `POST /api/v1/projects`, `GET /api/v1/projects`,
  `GET /api/v1/projects/{projectId}`, `POST …/{projectId}/{activate|complete|archive}`
- Content: `POST /api/v1/content`, `GET /api/v1/content/by-slug/{slug}`,
  `POST /api/v1/content/{contentId}/{publish|revise|archive}`
- Rubrics: `POST /api/v1/rubrics`, `GET /api/v1/rubrics/{rubricId}`
- Evaluations: `POST /api/v1/evaluations`, `GET /api/v1/evaluations/{evaluationId}`,
  `GET /api/v1/projects/{projectId}/evaluations`
- Decisions: `POST /api/v1/decisions`, `GET /api/v1/decisions/{decisionId}`,
  `GET /api/v1/projects/{projectId}/decisions`,
  `POST /api/v1/decisions/{decisionId}/{advisory|decide}`
- Health: `GET /api/health/live`, `GET /api/health/ready`

**Deferred:** no AI endpoint (the `AiRecommender` has no real provider yet — a route
would only return a stub, which is prohibited). Deferred to a later prompt.

## Route coverage

Every product route is implemented, documented in OpenAPI, and exercised by a real
HTTP + PostgreSQL test. The route↔OpenAPI equality is **enforced automatically** by
`openapi.contract.test.ts`; the HTTP-test column is verified by `test:api`.

| Method | Path | Implemented | OpenAPI | Real HTTP+PG test |
|--------|------|:---:|:---:|:---:|
| POST | /api/v1/projects | yes | yes | yes |
| GET | /api/v1/projects | yes | yes | yes |
| GET | /api/v1/projects/{projectId} | yes | yes | yes |
| POST | /api/v1/projects/{projectId}/activate | yes | yes | yes |
| POST | /api/v1/projects/{projectId}/complete | yes | yes | yes |
| POST | /api/v1/projects/{projectId}/archive | yes | yes | yes |
| GET | /api/v1/projects/{projectId}/evaluations | yes | yes | yes |
| GET | /api/v1/projects/{projectId}/decisions | yes | yes | yes |
| POST | /api/v1/content | yes | yes | yes |
| GET | /api/v1/content/by-slug/{slug} | yes | yes | yes |
| POST | /api/v1/content/{contentId}/publish | yes | yes | yes |
| POST | /api/v1/content/{contentId}/revise | yes | yes | yes |
| POST | /api/v1/content/{contentId}/archive | yes | yes | yes |
| POST | /api/v1/rubrics | yes | yes | yes |
| GET | /api/v1/rubrics/{rubricId} | yes | yes | yes |
| POST | /api/v1/evaluations | yes | yes | yes |
| GET | /api/v1/evaluations/{evaluationId} | yes | yes | yes |
| POST | /api/v1/decisions | yes | yes | yes |
| GET | /api/v1/decisions/{decisionId} | yes | yes | yes |
| POST | /api/v1/decisions/{decisionId}/advisory | yes | yes | yes |
| POST | /api/v1/decisions/{decisionId}/decide | yes | yes | yes |
| GET | /api/health/live | yes | yes | yes |
| GET | /api/health/ready | yes | yes | yes |

Every route above has at least one direct real-HTTP + PostgreSQL test in
`http.api.test.ts`.

## Versioning

Product routes are under `/api/v1`. Application use cases stay unversioned; the
version never leaks into domain types. Breaking changes get a new version prefix.

## Request validation

Zod schemas (`src/server/http/schemas.ts`), `.strict()` (unknown fields rejected),
intent-shaped and independent of domain constructors and Prisma. Distinguishes:
415 (wrong media type), 400 (malformed JSON / schema failure with field details),
422 (semantically rejected by domain/application). Path ids validated with the
domain id parser (400 on malformed).

## Response serialization

Explicit serializers (`src/server/http/serializers.ts`) — never `JSON.stringify`
of a domain object. Timestamps are ISO-8601 UTC. `lockVersion` is omitted from
bodies and exposed only as the ETag. List responses return `{ items: [...] }`;
mutable-resource list items carry an `etag` field.

## Error contract

`{ "error": { "code", "message", "requestId", "fields"? } }`. Stable machine codes,
safe messages, no stack traces, Prisma codes, SQL, constraint names, or causes.
One central mapping (`src/server/http/http-error.ts`) from neutral errors only.

## HTTP status mapping

201 create · 200 read/command · 400 malformed/invalid-precondition/invalid-id ·
401 actor required · 403 ownership denied · 404 not found · 409 conflict
(duplicate, invalid state transition, **stale write**) · 415 wrong media type ·
422 semantic rejection · 428 missing `If-Match` · 503 database unavailable ·
500 unexpected. Stale writes use **409** consistently (not 412).

## Concurrency-token design

ETag / If-Match. A single mutable resource returns a strong, resource-scoped ETag
`"<resource>:<lockVersion>"` in the **HTTP `ETag` header** (never `lockVersion` in
the body). Mutations require `If-Match`; the expected version is threaded to the use
case, which rejects a stale caller with `OptimisticConcurrencyError` → 409. Missing
token → 428; malformed or wrong-resource token → 400; a successful mutation returns
the **new** ETag. Append-only resources (rubric, evaluation) carry no token.

**List responses (decision: Option A).** An HTTP `ETag` header applies to the whole
representation, not to nested items, so **list items carry an explicit
`concurrencyToken` JSON field** (projects, decisions) — the same opaque,
resource-scoped token, to be **copied verbatim into `If-Match`** when mutating that
item. It is deliberately *not* named `etag` to avoid conflating an item mutation
token with a representation ETag. (Alternatives — no token in lists, or reusing
`etag` — were rejected as less clear.)

## Actor context (temporary) and status policy

`X-Stroman-Actor-Id` maps to an `OwnerId`. **Production invariant:** the mechanism is
enabled **only** when `NODE_ENV` is `development` or `test`; production (or any other
runtime) always disables it and **no environment variable can override this**, so the
header can never authenticate or impersonate a caller in production. Owner identity
for creation derives from the actor, never the request body (strict schemas reject an
`ownerId` field). Ownership checks remain in the application layer.

Status policy (temporary, until Prompt 006B):

| Situation | Status | Code |
|-----------|--------|------|
| Temporary adapter disabled (production) | 503 | `ACTOR_CONTEXT_UNAVAILABLE` |
| Missing actor context (dev/test) | 401 | `ACTOR_REQUIRED` |
| Malformed actor context | 400 | `INVALID_ACTOR` |
| Valid actor, another owner's resource | 403 | `FORBIDDEN` |

`503` represents an intentionally-unavailable API (no auth yet), **not** ordinary
missing credentials in development. Prompt 006B may refine authentication responses
(e.g. real 401s) **without changing the ownership-denial (403) semantics**. The
replacement is one seam: `resolveActor`.

## Dependency composition

`src/server/composition.ts` builds one `ApiContext` (repositories + clock + id
generator) — a superset of every use case's deps. No service locator, DI framework,
or global mutable registry; Prisma is not re-exported.

## Request IDs

`X-Request-Id` accepted if safe (`[A-Za-z0-9._-]{1,200}`), else generated; echoed on
every response and included in error bodies and logs. Never used for authorization.

## Logging

One structured line per request (requestId, method, path, status, durationMs,
error category). Never logs bodies, content, rationales, advisories, actor values,
credentials, or raw errors.

## Caching & CORS

All API responses set `Cache-Control: no-store` and `X-Content-Type-Options:
nosniff`. Same-origin defaults; no permissive CORS. CSRF posture is deferred to
Prompt 006B along with the authentication mechanism.

## Health

`live` returns 200 without touching the database; `ready` runs a bounded `SELECT 1`
via the composition boundary and returns 200/503.

## Pagination posture

Deferred. MVP collections (projects per owner, evaluations/decisions per project)
are bounded in practice. Add cursor-based pagination (stable ordering, deterministic
cursor, max limit, index support) when a collection can grow unbounded.

## Idempotency posture

No idempotency keys. Duplicate protection relies on application-generated ids,
database uniqueness (slug), and domain invariants (a decision cannot be decided
twice). Delivery-layer idempotency keys are a follow-up for external clients/webhooks.
Optimistic concurrency is not idempotency.

## OpenAPI source of truth

`docs/openapi/stroman-os-v1.yaml` (OpenAPI 3.1). Validated by `npm run openapi:validate`
and a contract test that also asserts the documented paths exactly match the
implemented route files (drift prevention).

## Testing strategy

- Unit: OpenAPI contract + pure mapping (in `npm test`, no database).
- Real HTTP + PostgreSQL: `npm run test:api` invokes route handlers with real
  `Request` objects against a real embedded PostgreSQL (create/get/list, lifecycle,
  slug conflict, publish concurrency, decision propose/advisory/decide, stale
  finalize, ownership denial, validation, error redaction, request-id echo).

## Explicit exclusions

No authentication providers/sessions/RBAC, AI provider endpoints, external
integrations, webhooks, queues, uploads, rate limiting, UI, or client SDKs.

## Migration path to Prompt 006B (authentication)

Replace `resolveActor` with authenticated-identity resolution (same return type,
one seam). Add 401 for unauthenticated requests, revisit 403 semantics, add CSRF
protection appropriate to the auth mechanism, and remove the dev actor header.
