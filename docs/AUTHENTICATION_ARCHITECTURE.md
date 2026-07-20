# Authentication Architecture (Prompt 006B)

Real, production-safe identity for Stroman OS. This replaces the temporary
development actor mechanism (`X-Stroman-Actor-Id` / `resolveActor`), which has been
removed entirely. Authentication is provider-contained, fail-closed, ownership-safe,
and browser-secure, with a clear path to future mobile clients and richer
authorization.

> **Live-provider status (updated Prompt 006B.1, 2026-07-19).** The provider-neutral
> core, the Supabase adapter, the identity model, CSRF/cookie policy, and authorization
> are implemented and verified against real PostgreSQL + real HTTP with a deterministic
> test authenticator and real cryptographic (jose) JWT verification. In 006B.1 the
> adapter's REST/JWT **contract was verified against current official Supabase
> documentation** (see [Live acceptance](#live-acceptance-prompt-006b1)), and the JWT
> verifier was **hardened with an explicit algorithm allowlist**. What remains **not**
> executed is the interactive end-to-end flow against a live throwaway Supabase project
> (real OTP email delivery, real verify/refresh/revocation, real cookie exchange, live
> JWKS verification) — because no isolated Supabase project, anon key, or test inbox is
> available in this environment, and OTP entry is human-in-the-loop. A turnkey harness
> (`npm run auth:acceptance`) and a fail-closed guard are provided to complete it. The
> system is **not approved for public production exposure** until that acceptance run
> passes.

## Selected provider and method

- **Provider:** Supabase Auth.
- **Method:** passwordless **email OTP** (a typed one-time code), not magic links.
- **Session strategy:** provider-issued JWT access token + refresh token.
  - Browser: stored in **secure HttpOnly cookies**.
  - Future mobile/API: **bearer access token** (`Authorization: Bearer …`).
- **Evaluation date:** 2026-07-19. Rationale recorded in ADR-0018.

Why OTP over magic links: a typed code works identically in a browser and a native/
hybrid mobile app, avoids same-device email-link and deep-link fragility, and is
unambiguous inside embedded webviews. Why Supabase: it is PostgreSQL-native (fits the
existing Prisma/PG stack), supports Next.js server-side sessions, verifies tokens
server-side, has first-class email OTP, a generous free tier, and low operational
burden. Alternatives (Auth.js, Clerk, custom) were rejected in ADR-0018.

Passwords and social login are intentionally **not** implemented (no current
requirement).

## Provider replacement boundary

Provider specifics live **only** under `src/server/auth/supabase/**` and are reached
through two provider-neutral ports in `src/server/auth/types.ts`:

- `RequestAuthenticator` — verifies an inbound request's credentials → `AuthOutcome`.
- `AuthGateway` — drives the email-OTP flow (`startEmailOtp`, `verifyEmailOtp`, `signOut`).

No Supabase SDK, URL, key, token, cookie, or error type crosses these ports. The
domain, application use cases, application views, repository contracts, HTTP response
contracts, and shared errors contain **zero** provider references. Swapping providers
means writing one new adapter pair behind the same ports — the domain is untouched.

## Request pipeline

```
HTTP request
  → getRequestAuthenticator().authenticate(req)      (verify cookie/bearer JWT)
  → AuthOutcome (anonymous | authenticated | invalid | unavailable)
  → [cookie + unsafe method] Origin/CSRF check
  → resolveAuthenticatedActor(principal)             (map to internal identity)
  → AuthenticatedActor { userId, ownerId }
  → route handler → application use case → Prisma → PostgreSQL
```

`authenticateRequest` (`src/server/auth/authenticate-request.ts`) is the single
authoritative gate. Route handlers call it exactly where they previously called
`resolveActor`; use cases still perform the authoritative ownership checks.

## Credential transport

| Client | Transport | CSRF |
|--------|-----------|------|
| Browser | HttpOnly session cookie (`__Host-sos_at` / dev `sos_at`) | Origin check on unsafe methods |
| Future mobile/API | `Authorization: Bearer <access token>` | Exempt (not an ambient credential) |
| Application / domain | provider-neutral `AuthenticatedActor` only | — |

No access or refresh token is ever exposed to page JavaScript, placed in
`localStorage`, put in a URL, logged, or returned in a response body.

## Session model

- **Creation:** `POST /api/auth/verify` exchanges an OTP for a Supabase session and
  sets the cookies.
- **Access token:** short-lived (Supabase default ~1 hour); the `sos_at` cookie's
  `Max-Age` tracks the token TTL.
- **Refresh token:** stored in `sos_rt` (HttpOnly), 30-day cookie lifetime.
- **Refresh:** Supabase manages token refresh. For the MVP there is **no automatic
  server-side/middleware refresh**; when the access token expires the client
  re-verifies or a future refresh endpoint is added (see Backlog). This is documented
  rather than faked.
- **Sign-out:** `POST /api/auth/sign-out` best-effort revokes at the provider and
  clears both cookies (idempotent, CSRF-protected).
- **Clock skew / expiry:** enforced by `jose` during JWT verification; an expired or
  invalid token yields `401 INVALID_SESSION`.
- **Provider outage:** verification failures that are not "bad token" fail closed
  (`503 AUTHENTICATION_UNAVAILABLE`); the system never falls back to a synthetic actor.

## Cookie policy

`src/server/auth/cookies.ts`. Attributes: `HttpOnly`, `SameSite=Lax`, `Path=/`, no
`Domain` (host-only), bounded `Max-Age`. In **production**: `Secure` + the `__Host-`
prefix (the browser then enforces Secure + Path=/ + no Domain). In **development**
over http the prefix and `Secure` are dropped (the browser would otherwise reject the
cookie) — an intentional, documented difference. Cookie values are URL-encoded.

## CSRF strategy

Because cookies are ambient, every **state-changing** (non-GET/HEAD/OPTIONS)
**cookie-authenticated** request must present an `Origin` header on the allowlist
(`APP_ALLOWED_ORIGINS`, defaulting to the app's own origin). A foreign **or missing**
origin fails closed → `403 REQUEST_ORIGIN_REJECTED`. `SameSite=Lax` is a first layer;
Origin verification is the authoritative one. Bearer-authenticated requests are exempt
(a bearer token is not sent automatically). CORS is **not** relied on for CSRF.

## CORS policy

Same-origin by default: no `Access-Control-Allow-Origin`, no credentialed wildcard, no
reflected origins, no preemptive cross-origin access. Future mobile bearer clients do
not need CORS (native HTTP, not browser fetch). Revisit only when a real cross-origin
browser client exists.

## Internal identity model

Stroman OS owns its identity; the provider only *verifies* it.

- `users` — stable internal identity (`id`, `status`, timestamps). The `id` is
  generated by Stroman OS, so it survives a provider migration.
- `user_identities` — verified mapping `(provider, provider_subject) → user_id`, with
  `normalized_email` (audit only) and `last_authenticated_at`. `(provider,
  provider_subject)` is **unique** and is the only key used to resolve a returning
  user.

Invariants: email is never a primary key or authorization key (it is mutable at the
provider); the provider subject is never used directly as a business id; internal ids
are stable across provider changes; identity creation is race-safe and transactional.

## Provider identity mapping & owner mapping

- **Provider subject → internal user:** looked up / created via `user_identities`.
- **Owner mapping (Option A):** the internal `user.id` **is** the `ownerId`. The two
  share the `usr_` id shape, so the derivation is a validated re-brand, performed
  server-side in `resolveAuthenticatedActor`. Option B (separate owner/account record)
  and Option C (mapping table) were rejected as unnecessary for a single-user
  ownership MVP; the model can grow into them without replacing authentication.

There is **no** database foreign key from `projects.owner_id` to `users.id`: business
records must never cascade-delete when an identity is removed, and pre-existing owner
references must not require fabricated user rows. The equality is enforced at the
application layer.

## First-login provisioning

Lazy, on the first authenticated request (`resolveAuthenticatedActor` → repository
`provision`). The repository:

1. looks up the identity by `(provider, subject)`; if found, refreshes
   `last_authenticated_at` and returns the existing user;
2. otherwise inserts the user **and** identity in one transaction;
3. if a concurrent first login wins the race (unique-constraint violation), re-reads
   the survivor instead of creating a duplicate.

Provisioning is transactional (no orphan user on failure) and race-safe (verified with
concurrent real-PostgreSQL requests). No client-submitted email or id is trusted.

## Account status

`ACTIVE` | `DISABLED`. A disabled account is rejected at authentication with
`403 ACCOUNT_DISABLED` before any resource access. Disabling is preferred over
deletion; business records are never cascade-deleted with an identity. User deletion is
not implemented in the MVP (see Backlog / Known Limitations).

## Authorization policy

Ownership-based, authoritative in the application layer:

- create → owner derived from the authenticated identity;
- list → scoped to the authenticated owner;
- get / mutate → owner must match (`ensureOwner`), else denied.

Middleware is **not** used (route-level server authentication is authoritative and
avoids Edge/Node runtime pitfalls with Prisma; see ADR-0018). No RBAC/roles/teams.

## Resource-existence concealment

Current policy: cross-owner access to an owned resource returns **403 FORBIDDEN**
(consistent with the pre-006B contract). Existence is not otherwise concealed at this
stage. A future refinement may return 404 for private direct resources to conceal
existence; if adopted it will be applied consistently across direct reads, mutations,
and project-scoped child lists, and documented here and in OpenAPI. Slug-based content
reads are currently unauthenticated-authorship (knowledge base has no owner yet — see
Known Limitations) but still require a verified session.

## Public vs protected routes

Protection is **allowlist-by-construction**: a route is protected iff it calls
`authenticateRequest`. A route-coverage test (`http.api.test.ts` /
`auth.api.test.ts`) asserts the product routes reject anonymous callers, so a new
route cannot silently become public.

- **Public:** `GET /api/health/live`, `GET /api/health/ready`,
  `POST /api/auth/start`, `POST /api/auth/verify`, `GET /api/auth/session`,
  `POST /api/auth/sign-out` (self-managed CSRF).
- **Protected (verified identity required):** every `/api/v1/**` route.

## Authentication endpoints

| Endpoint | Purpose | Cookies | CSRF | Notes |
|----------|---------|---------|------|-------|
| `POST /api/auth/start` | Send email OTP | none | n/a (pre-session) | Neutral response (no enumeration); 429 on provider rate limit |
| `POST /api/auth/verify` | Verify OTP, open session | sets `at`+`rt` | n/a (pre-session) | 401 `INVALID_OTP` on bad code; tokens only in cookies |
| `POST /api/auth/callback` | Complete magic-link sign-in | sets `at`+`rt` | Origin required (same-origin only) | Re-verifies the access-token JWT before setting cookies; 401 if invalid |
| `GET /api/auth/session` | Report auth state | none | n/a (GET) | Returns `{ authenticated }` only |
| `POST /api/auth/sign-out` | End session | clears `at`+`rt` | Origin required if a cookie is present | Idempotent; best-effort provider revoke |

### Magic-link (email link) flow

Supabase's locked default Free-plan template emails a `{{ .ConfirmationURL }}` that
points to Supabase's own `/auth/v1/verify`, which (implicit flow — no PKCE) redirects
to our `redirect_to` with the session in the URL **fragment**. To support it without
editing templates, configuring SMTP, or handling service-role keys in the browser:

1. `POST /api/auth/start` sends `redirect_to=<origin>/auth/callback` (from
   `getEmailRedirectUrl()`; overridable via `SUPABASE_EMAIL_REDIRECT_URL`).
2. The user clicks the link; Supabase verifies it and redirects to
   `/auth/callback#access_token=…&refresh_token=…&expires_in=…` (or `#error=…`).
3. The `/auth/callback` client page reads the fragment (unavoidable for implicit
   flow), holds tokens in memory only, and POSTs them to `POST /api/auth/callback`.
4. That route enforces a same-origin `Origin` (CSRF), **re-verifies the access-token
   JWT through the same authenticator used for every request** (so a forged token is
   rejected), sets the existing HttpOnly `at`/`rt` cookies, and the page scrubs the
   fragment and redirects to a validated internal path (`safeInternalPath`, default
   `/projects`). Internal provisioning stays lazy on the first authenticated request.

**Required one-time dashboard action:** add `<origin>/auth/callback` (e.g.
`http://localhost:3000/auth/callback`) to Supabase → Authentication → URL
Configuration → **Redirect URLs**. Supabase only redirects to allowlisted URLs.

The OTP-entry path (`/api/auth/verify`) remains available unchanged.

## HTTP error / status mapping

| Condition | Status | Code |
|-----------|--------|------|
| No credentials | 401 | `AUTHENTICATION_REQUIRED` (+ `WWW-Authenticate: Bearer`) |
| Invalid/expired credentials | 401 | `INVALID_SESSION` (+ `WWW-Authenticate: Bearer`) |
| Invalid OTP | 401 | `INVALID_OTP` |
| Disabled account | 403 | `ACCOUNT_DISABLED` |
| Cross-owner access | 403 | `FORBIDDEN` |
| CSRF/origin rejected | 403 | `REQUEST_ORIGIN_REJECTED` |
| Provider/identity-store outage | 503 | `AUTHENTICATION_UNAVAILABLE` |
| Provider rate limit | 429 | `RATE_LIMITED` |
| Malformed auth request | 400 | `VALIDATION_FAILED` / `MALFORMED_JSON` |

Provider error messages, tokens, session ids, claims, project ids, stack traces, and
database failures are never surfaced.

## Failure behavior (fail closed)

Provider unavailable → reject; verification throws → no actor; identity mapping fails →
reject (503); duplicate provisioning race → one user survives, request resolves;
disabled account → no access; malformed cookie/token → 401; missing CSRF proof → no
mutation; database unavailable → no access. **Never** defaults to a synthetic actor.

## Logging & secret redaction

Structured request logs carry request id, method, path, status, duration, and error
category only. Never logged: access/refresh tokens, cookies, OTP codes, raw
`Authorization` headers, full email addresses, provider session payloads, JWT claims,
provider error responses, CSRF tokens. A dedicated security audit log (sign-in,
provisioning, disable, denial, final human decision) is deferred (see Backlog).

## Rate-limit / abuse posture

The OTP endpoints rely on **Supabase's native rate limits** for the MVP (surfaced as
429). No weak in-memory application limiter is added (it would fail across instances).
Application-level per-IP/per-identifier limiting is a **blocking** item before public
production exposure of the OTP endpoints (Backlog). Product-route rate limiting remains
deferred for the authenticated MVP threat model.

## Provider webhooks

Not implemented. User deletion/email-change/disable reconciliation is handled lazily
(status is read at each authentication; email is audit-only). Webhooks are deferred
until a correctness need exists (Backlog); if added they will verify signatures, be
idempotent, and reject invalid signatures.

## Database authorization posture (RLS)

Row-Level Security is **not** implemented. All database access is through a single
trusted server that enforces ownership in the application layer; RLS would add
unverified complexity and depends on provider-issued JWT claims reaching the DB
connection, which the current Prisma pooling model does not do. Trigger conditions for
adopting RLS (untrusted direct DB access, multi-tenant isolation requirements, or
Supabase client-side data access) are tracked in Backlog. No claim of database-level
tenant isolation is made.

## Test-auth architecture & production-bypass prevention

The test authenticator/gateway (`test/adapters/test-auth.ts`) are injected **only**
through explicit composition setters (`setRequestAuthenticatorForTests`,
`setAuthGatewayForTests`) that **throw if `NODE_ENV === "production"`**. They are never
selected by a header, query parameter, cookie, or environment flag. Production always
builds the real Supabase adapters. A test asserts the setters throw in production, and
another asserts the former `X-Stroman-Actor-Id` header grants no access.

## Environment configuration

`src/lib/env/env.server.ts`. New (all placeholder-only in `.env.example`):
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET` (optional),
`SUPABASE_JWT_AUD` (default `authenticated`), `APP_ALLOWED_ORIGINS`. Production startup
**fails closed** if `SUPABASE_URL` or `SUPABASE_ANON_KEY` is missing. Secrets are never
exposed to the client bundle (server env is guarded by `server-only`) and never logged.

## Live acceptance (Prompt 006B.1)

### Provider-contract verification (2026-07-19)

Verified against current **official Supabase documentation** (primary sources):

- Passwordless email OTP guide — <https://supabase.com/docs/guides/auth/auth-email-passwordless>
- JWT signing keys / JWKS — <https://supabase.com/docs/guides/auth/signing-keys>
- JWTs — <https://supabase.com/docs/guides/auth/jwts>
- Auth API reference (verifyOtp) — <https://supabase.com/docs/reference/javascript/auth-verifyotp>

Findings (all consistent with the implementation):

- **OTP verify:** `POST /auth/v1/verify`, body `{ email, token, type: "email" }`,
  response `{ access_token, refresh_token, ... }` — matches `SupabaseAuthGateway`.
- **OTP start:** `signInWithOtp` → `POST /auth/v1/otp` with `{ email, create_user }`
  — matches the adapter.
- **OTP defaults:** six-digit code, 60-second resend cooldown, **1-hour** expiry.
- **JWKS:** `GET /auth/v1/.well-known/jwks.json` (asymmetric RS256/ES256, Edge-cached
  ~10 min) — matches the derived `jwksUrl`.
- **Issuer:** `https://<ref>.supabase.co/auth/v1`; **audience:** `authenticated` —
  match config defaults.

**Hardening applied (proven defect, §10):** the `jose` verifier now pins an explicit
**algorithm allowlist** — `["RS256","ES256"]` for JWKS, `["HS256"]` for the legacy
shared secret — rejecting `alg=none` and algorithm-confusion attacks (regression tests
added). No silent downgrade from asymmetric to shared-secret verification occurs;
symmetric HS256 is used only when `SUPABASE_JWT_SECRET` is explicitly set.

### OTP email-template requirement (confirmed live 2026-07-19)

To send a **typed 6-digit code** (not a link), the email template Supabase actually
renders must include `{{ .Token }}` (it renders the numeric OTP). **Which template is
used depends on the user:**

- **New user** (the acceptance flow provisions users via `create_user: true`) →
  Supabase sends the **"Confirm signup"** template. By default it contains only
  `{{ .ConfirmationURL }}` (a link) — this is exactly the failure observed in 006B.1
  acceptance: the email had no numeric code, so verify returned invalid.
- **Returning user** OTP sign-in → the **"Magic Link"** template.

**Fix (throwaway project dashboard, no repo/code change):** add `{{ .Token }}` to
**both** the *Confirm signup* and *Magic Link* templates (Authentication → Email
Templates). Then request a fresh OTP. `type: "email"` verification accepts the token
from either. Record this in project settings, not in the repo; no production branding.

### Session-refresh decision — Option A (explicitly defer)

No server-side refresh in the MVP. Access tokens expire (~1h); the server-owned cookie
model does not auto-refresh (the Supabase SDK only auto-refreshes client-side, which we
deliberately avoid to keep tokens out of JS). Acceptable **only** while the app is
non-public and there is no login UI. A server-side refresh endpoint (rotating the
HttpOnly refresh cookie via the adapter) is **blocking before a real browser UX ships**
— tracked in Backlog. Documented, not faked.

### OTP abuse-limit decision — Option B required before public exposure

Supabase-native limits (per-email 60s cooldown, 1h expiry, project-wide limits) are
adequate **only** for private/narrow initial use. A durable, deployment-compatible
(not in-memory) application/edge limiter is **blocking before public exposure** of the
OTP endpoints — tracked in Backlog.

### Repeatable acceptance procedure

Do **not** use production. Use an isolated throwaway project, synthetic inbox, and a
git-ignored `.env.auth-acceptance`.

1. Create an isolated Supabase project; set the Magic Link template to include
   `{{ .Token }}`; prepare a synthetic test inbox.
2. Create `.env.auth-acceptance` (git-ignored) with: `SUPABASE_URL`,
   `SUPABASE_ANON_KEY`, `APP_ALLOWED_ORIGINS=http://localhost:3000`,
   `STROMAN_AUTH_ACCEPTANCE_PROJECT=true`, `AUTH_ACCEPTANCE_EMAIL=<synthetic>`. Leave
   `SUPABASE_JWT_SECRET` unset to verify via JWKS (preferred).
3. Start the server with that env (real Supabase adapter):
   `node --env-file=.env.auth-acceptance ./node_modules/.bin/next dev`.
4. Run the fail-closed harness: `npm run auth:acceptance`. Enter the emailed OTP when
   prompted (input is not echoed; never printed/committed).
5. The harness exercises flows A–I (start, verify+cookies, session, authenticated
   create, list scoping, stale-ETag 409, foreign-origin 403, sign-out) and prints
   PASS/FAIL only — no secrets, tokens, OTP, or cookie values.
6. Manually confirm Flow H (invalid/expired/wrong-aud/wrong-iss → 401), Flow J
   (provider outage → 503 fail-closed), and Flow K (disabled internal account → 403)
   using the existing automated suites plus a short-lived token.

The harness (`scripts/verify-supabase-auth.mjs`) refuses to run against production, a
non-local origin, or without the explicit `STROMAN_AUTH_ACCEPTANCE_PROJECT=true` flag,
which affects **only** the tooling and enables **no** runtime bypass. No production
security is weakened to enable testing; production composition always uses the real
verifier.

#### Optional `generateLink` automation mode (acceptance-only)

New Free-plan Supabase projects often have **link-only default templates** (no
`{{ .Token }}`), so no numeric OTP is emailed. To complete acceptance without editing
templates or configuring SMTP, the harness supports a **service-role-gated** mode:

- Enable with `AUTH_ACCEPTANCE_GENERATE_LINK=true` **and** `SUPABASE_SERVICE_ROLE_KEY`
  (throwaway project only). The service-role key is required **only** when the flag is
  on, is used **solely inside the acceptance script**, and is **never printed**.
- The harness ensures a confirmed user exists (Admin API), then retrieves the 6-digit
  OTP via `admin/generate_link` (no email sent/read) and feeds it to the **real**
  `/api/auth/verify`. It changes **nothing** in the application or production auth path
  and does not weaken coverage — the same provider boundary is exercised; only OTP
  retrieval is automated. It fails closed unless the project is the marked throwaway
  acceptance project. This is a **test-only workaround**, not an equivalent to fixing
  templates for real users. Manual email entry remains the default mode.

### Not yet executed (blocks public production)

Real OTP email delivery, real OTP verification, live provider session issuance, live
JWKS verification, real cookie exchange, and live logout/revocation timing have **not**
been run (no throwaway project/credentials/inbox in this environment). Complete via the
procedure above before public exposure.

## Explicit exclusions

No login UI, design system, onboarding, organizations, teams, memberships, invitations,
RBAC, social login, SSO/SCIM, billing, external AI/Notion/Calendar/Zoom integrations,
uploads, general webhook platform, analytics, notifications, admin console, account-
merging UI, mobile app, or public API keys.

## Future roles / membership path

The stable internal `user` identity and the provider-neutral boundary allow adding
organizations, memberships, and roles later by introducing an owner/account record or a
membership table and extending `AuthenticatedActor` — without replacing authentication
or touching the domain.
