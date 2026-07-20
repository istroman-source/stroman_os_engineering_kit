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
- Auth (public): `POST /api/auth/start`, `POST /api/auth/verify`,
  `GET /api/auth/session`, `POST /api/auth/sign-out`
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
| POST | /api/auth/start | yes | yes | yes |
| POST | /api/auth/verify | yes | yes | yes |
| GET | /api/auth/session | yes | yes | yes |
| POST | /api/auth/sign-out | yes | yes | yes |
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

## Authentication and authorization (Prompt 006B)

Real identity via Supabase Auth (passwordless email OTP) behind a provider-neutral
boundary. `authenticateRequest` (`src/server/auth`) is the single gate; it replaced the
temporary `resolveActor`/`X-Stroman-Actor-Id` mechanism, which is **removed** — there is
no caller-controlled identity header. Owner identity is derived server-side from the
internal user id, never from a request body (strict schemas reject an `ownerId` field).
Ownership checks remain authoritative in the application layer. Full detail:
[docs/AUTHENTICATION_ARCHITECTURE.md](AUTHENTICATION_ARCHITECTURE.md).

**Transport:** browser = secure HttpOnly session cookie (`__Host-sos_at`, dev
`sos_at`); future mobile/API = `Authorization: Bearer` access token. Both verify a
Supabase JWT through the same neutral adapter.

**Security schemes (OpenAPI):** `cookieAuth` (apiKey in cookie) and `bearerAuth` (http
bearer); global `security` requires either. Public routes (health, auth start/verify/
session/sign-out) set `security: []`.

**CSRF:** state-changing **cookie** requests require a same-origin `Origin` header
(allowlist); a foreign/missing origin → `403 REQUEST_ORIGIN_REJECTED`. Bearer requests
are exempt. CORS is not relied on for CSRF.

**Status policy:**

| Situation | Status | Code |
|-----------|--------|------|
| No credentials | 401 | `AUTHENTICATION_REQUIRED` (+ `WWW-Authenticate: Bearer`) |
| Invalid/expired credentials | 401 | `INVALID_SESSION` |
| Invalid OTP (verify) | 401 | `INVALID_OTP` |
| Disabled account | 403 | `ACCOUNT_DISABLED` |
| Another owner's resource | 403 | `FORBIDDEN` |
| CSRF/origin rejected | 403 | `REQUEST_ORIGIN_REJECTED` |
| Provider / identity-store outage | 503 | `AUTHENTICATION_UNAVAILABLE` |
| Provider rate limit | 429 | `RATE_LIMITED` |

**Resource-existence concealment:** cross-owner access returns 403 (existence not
otherwise concealed at this stage; a consistent 404 policy is a documented future
option). **Test auth** is injectable only via composition setters that throw in
production — no runtime bypass.

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
nosniff`, so authenticated responses are never stored by shared/CDN caches. Auth
responses (start/verify/session/sign-out) are also `no-store`. Same-origin defaults;
no permissive CORS (no credentialed wildcard, no reflected origins). CSRF is enforced
via Origin verification on cookie-authenticated state-changing requests (see the
Authentication section).

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

No RBAC/roles, AI provider endpoints, external integrations, webhooks, queues,
uploads, product-route rate limiting, UI, or client SDKs. Authentication (Supabase
email OTP) is now implemented — see the Authentication section.

## Prompt 006B (authentication) — done

`resolveActor` / `X-Stroman-Actor-Id` were removed and replaced by
`authenticateRequest` (Supabase-backed, provider-neutral). Unauthenticated requests
get 401; ownership denial stays 403; CSRF is enforced for cookie sessions; real
security schemes are documented in OpenAPI. End-to-end verification against a live
Supabase project remains outstanding — see
[docs/AUTHENTICATION_ARCHITECTURE.md](AUTHENTICATION_ARCHITECTURE.md).
