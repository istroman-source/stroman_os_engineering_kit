# Engineering Design Review — Gate 1 (Prompt 002.5)

Reviewer roles: Principal Architect, Staff FE/BE/Platform, Security, DevOps, UX
Systems, AI Systems, Technical Writer. Date: 2026-07-17.
Assumption: commercial multi-tenant SaaS, thousands of creators, many years, many
engineers, multiple AI providers, enterprise customers.

## 1. Executive summary

The Prompt 002 foundation is **sound and, after this review's fixes, approvable**.
It is a clean modular monolith with mechanically-enforced layering, a coherent
dark-first design-token system, well-tested cross-cutting utilities, and a
complete toolchain (lint, typecheck, unit, e2e, build, CI, Docker). The review
found **one genuine latent security flaw** (env module mixed a server secret with
public config, inviting future client-bundle leakage) and several foundation-grade
gaps (no log redaction, no skip link, native dark controls). All were fixed. No
issue rose to the level of rejection.

Verification after fixes: lint ✅ · typecheck ✅ · unit **51/51** ✅ · e2e **2/2** ✅
· build ✅.

## 2. Architecture assessment

- **Shape:** modular monolith (one Next.js app). Correct for MVP; the layering
  makes future service extraction (worker, AI gateway) a lift-and-shift, not a
  rewrite. Holds at 50/100/500 features and 500k LOC because boundaries are
  enforced, not aspirational.
- **Layering:** `app`/`ui` → `server` → `domain`, with `lib` cross-cutting.
  Dependencies point inward; the domain is pure. Enforced by ESLint
  `no-restricted-imports`, not convention.
- **RSC-first:** only `providers` and `nav-links` are client components; the shell
  and pages are Server Components. Minimal client JS by default.

## 3. Strengths

- Enforced module boundaries (lint fails on violations).
- Single source of truth for design tokens; zero hardcoded style values.
- Deterministic tests (injected clocks and log sinks) — no reliance on wall clock.
- Strict TypeScript (`noUncheckedIndexedAccess`, `noImplicitOverride`).
- Provider-agnostic architecture ready for multiple AI vendors.
- Honest scope: navigation never implies unfinished features are live.

## 4. Weaknesses (found this review)

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| W1 | High | `env.ts` mixed `DATABASE_URL` (secret) with `NEXT_PUBLIC_APP_URL`; `config` (imported by shell) transitively pulled it — a future client import would bundle a secret. | **Fixed** |
| W2 | Medium | Logger had no redaction — credentials could be logged accidentally. | **Fixed** |
| W3 | Medium | `domain`/`server` layers referenced by lint + docs but absent on disk. | **Fixed** (prior gate) |
| W4 | Low | No skip-to-content link (WCAG 2.4.1). | **Fixed** |
| W5 | Low | No `color-scheme`, so native controls/scrollbars stayed light in dark UI. | **Fixed** |
| W6 | Low | `output: "standalone"` broke `next start`. | **Fixed** (prior gate) |

## 5. Risks

- **Prisma pinned to v6** for kit compatibility; v7 migration deferred (backlog).
- **Local Node via `~/.local/node`** (Homebrew needed an interactive password);
  team onboarding needs a standardized install.
- **No DB-backed routes yet**, so CI e2e has no Postgres service — add when needed.
- **Auth/authorization not built** — the SRS requires server-side workspace
  authorization; the `server` boundary is prepared but empty (by design).

## 6. Technical debt

Low. Conscious items: spacing uses Tailwind's default scale (acceptable — it *is*
the token scale in v4); `loadConfig`/feature-flags exist as infra without a wired
env-sourced singleton yet (intentional; wired when first consumed). No dead code,
TODOs, duplicate logic, or circular dependencies.

## 7. Improvements made (this review)

1. **Env split + `server-only` guard.** `env.client.ts` (public only),
   `env.server.ts` (secrets, guarded), shared `error.ts`. `@/lib/env` exposes only
   the client-safe surface; secrets require the explicit `@/lib/env/env.server`
   path, which cannot be bundled into client code.
2. **Config split.** Client-safe `constants.ts` (APP_NAME/VERSION); server-only
   `app-config.ts`; `@/lib/config` re-exports only constants + the `AppConfig` type.
3. **Logger redaction.** Sensitive keys (password, token, secret, apiKey,
   authorization, cookie, …) redacted recursively by default, with cycle safety;
   `redactKeys` extensible.
4. **Skip-to-content link** + focusable `<main id="main-content">`.
5. **`color-scheme`** tokens for dark/light native controls.
6. **Vitest `server-only` alias** so server modules are unit-testable.

## 8. Improvements deferred (with rationale)

- **Theme toggle / persisted theme** — needs a client theme provider; not required
  by foundation. Tokens already support `.light`.
- **Env-sourced feature-flags singleton** — add when a feature first gates on it.
- **CI: Postgres service, `npm audit` gate, Playwright browser cache** — add when
  routes touch the DB; audit gating deferred to avoid flaky failures on transitive
  advisories.
- **Prisma 7 adoption** — after planning the config-file + driver-adapter migration.
- **ADRs** — formalize decisions in kit Prompt 003.

## 9. Updated directory tree (src)

```
src/
  app/  (app)/{dashboard,projects,settings}  layout providers page globals.css
  domain/README.md            # pure layer (enforced, empty by design)
  server/README.md            # server-only layer (enforced, empty by design)
  lib/
    config/{constants,app-config(server-only),index}
    env/{env.client,env.server(server-only),error,index}
    result/ errors/ logging/ feature-flags/ validation/ id/ datetime/  tokens.ts
  ui/ cn page-header primitives/button shell/{app-shell,sidebar,top-nav,nav-links,nav-config}
  styles/tokens.css
test/server-only-stub.ts
e2e/shell.spec.ts
```

## 10. Dependency analysis

Import graph (non-test), all edges point inward — **no cycles, no forbidden
imports**:

```
app/* ─▶ ui/*, lib/config(constants)
ui/shell/* ─▶ lib/config(constants), ui/cn
lib/config/app-config ─▶ lib/env/env.server (server-only), lib/logging
lib/env/env.server ─▶ lib/env/env.client, lib/env/error, server-only
lib/datetime ─▶ lib/result
lib/validation ─▶ lib/errors, lib/result
```

Isolation verified: client components (`providers`, `nav-links`) reach **no**
server/secret module; `lib` never imports `ui`/`app`; domain purity + UI/server
separation enforced by ESLint.

## 11. Scalability assessment

Structure scales: per-feature verticals will live under `app` + `server` +
`domain` + `ui`, all bounded by the enforced dependency rule. Extraction points
are clear (worker/queue, AI gateway, search). No shared "god" modules; `lib`
subfolders are single-purpose. Risk at scale is process discipline (many
engineers) — mitigated by lint-enforced boundaries and coding standards.

## 12. Security assessment

- **Secrets:** now isolated behind `server-only`; `.env*` gitignored except the
  example; no secrets in source. **Strong.**
- **Logging:** default redaction of sensitive keys. **Good baseline.**
- **Validation:** Zod at boundaries (`lib/validation`, env schemas).
- **Output encoding:** React escapes by default; no `dangerouslySetInnerHTML`.
- **AuthN/AuthZ:** not yet implemented (by design); `server` boundary reserved and
  documented to require server-side workspace authorization.
- **Dependencies:** npm 11 install-script allowlist is explicit; recommend adding
  a scheduled `npm audit`/Dependabot before beta.

## 13. Performance assessment

- **Rendering:** RSC-first; static prerender of all current routes.
- **Client JS:** minimal (query provider + one nav component).
- **Code splitting:** App Router route-level splitting out of the box.
- **Hydration:** low surface; no large client trees.
- **Caching:** TanStack Query configured (staleTime, no refetch-on-focus).
- **Cold start:** small; standalone-free conventional server. Future: add bundle
  analysis and DB query budgets when data arrives.

## 14. AI readiness assessment

The architecture supports OpenAI, Anthropic, Gemini, OpenRouter, local LLMs, and
future providers **without touching business logic**, because the enforced
dependency rule forbids the domain from importing provider SDKs — providers must
sit behind adapters implementing app/domain-owned contracts. The provider
contract itself is intentionally not built yet (kit Prompt 051). No refactor
needed; the foundation is provider-neutral by construction.

## 15. Documentation assessment

A senior engineer can onboard from the repo: `README` (quick start, scripts),
`docs/ARCHITECTURE` (layers, boundaries, rationale), `LOCAL_DEVELOPMENT`,
`CODING_STANDARDS`, plus `domain/`+`server/` READMEs stating each layer's rules.
Gaps: no ADR log yet (deferred to Prompt 003), no `SECURITY.md`/`CONTRIBUTING.md`
(recommended before external contributors).

## 16. Quality scorecard

| Category | Score | Notes (for <95) |
|---|---:|---|
| Architecture | 96 | Clean, enforced layering. |
| Folder structure | 96 | Single-purpose folders; layers concrete. |
| Maintainability | 95 | Small modules, typed contracts. |
| Scalability | 92 | Sound; unproven past MVP; extraction points identified. |
| Developer experience | 94 | Full toolchain; −local Node install not standardized. |
| Documentation | 90 | Strong; no ADRs/SECURITY.md/CONTRIBUTING yet. |
| Testing | 92 | 51 unit + 2 e2e; no coverage thresholds or a11y automation yet. |
| Security | 93 | Secrets isolated, redaction added; authz + audit pipeline pending. |
| Performance | 90 | RSC-first & minimal JS; no bundle budgets/DB profiling yet (no data). |
| Accessibility | 92 | Focus, skip link, color-scheme, ARIA; no automated a11y checks yet. |
| AI readiness | 95 | Provider-neutral by construction. |
| **Overall** | **93** | Foundation complete, verified, and clean. |

## 17. Recommendation

**APPROVED WITH MINOR CHANGES** — and the minor changes identified (W1–W6) have
already been implemented and verified in this gate. The remaining deferred items
are non-blocking and tracked in `docs/BACKLOG.md`. The foundation is ready for
feature development to begin at Prompt 003 upon explicit approval.
