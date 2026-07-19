# Engineering Architecture

This document describes the **engineering** architecture: how the codebase is
organized and the rules that keep it maintainable as it grows. It complements
the product-level `docs/SYSTEM_ARCHITECTURE.md`.

## Shape: modular monolith

Per `engineering/REFERENCE_ARCHITECTURE.md`, the MVP is a single Next.js
application (a modular monolith). Services are extracted only under measured
pressure, not speculatively. This keeps the surface small while the domain is
still being discovered.

## Dependency rule

Dependencies point inward, toward the domain:

```
app / ui  ─▶  server (services)  ─▶  domain (pure)
                     │
                     ▼
             lib (cross-cutting infra)
```

- **The domain layer is pure.** It must not import React, Next, Prisma, or any
  provider SDK. Enforced by ESLint (`no-restricted-imports`).
- **UI never makes authorization decisions.** Those live server-side.
- **Adapters implement contracts** owned by the application/domain boundary;
  domain code depends on interfaces, never on concrete providers.

These are enforced mechanically in `eslint.config.mjs`, not left to convention.

## Folder structure

Every top-level folder under `src/` has exactly one responsibility. There is no
`misc`, `utils`, or `helpers` dumping ground.

| Path                | Responsibility                                                              |
| ------------------- | -------------------------------------------------------------------------- |
| `src/app`           | Next.js App Router only — routing, layouts, pages. Thin; delegates outward. |
| `src/ui`            | Presentation: design-system primitives, the app shell, shared components.   |
| `src/domain`        | Pure business logic and types. No framework, provider, or IO imports. See `src/domain/README.md`. |
| `src/server`        | Server-only code: services, data access, authorization. See `src/server/README.md`. |
| `src/lib`           | Cross-cutting engineering infrastructure, one concern per subfolder.        |
| `src/styles`        | Global CSS and the design-token source of truth.                            |

### Why these boundaries

- **`app` stays thin** so routing concerns never entangle with business logic —
  pages compose `ui` + `server` rather than containing logic themselves.
- **`ui` is separate from `app`** so components are reusable across routes and
  testable in isolation (see the Vitest component tests).
- **`domain` is isolated and pure** so core rules are portable, fast to test,
  and insulated from framework churn.
- **`server` is a distinct boundary** so server-only concerns (secrets, DB,
  authorization) can never be imported into the client bundle.
- **`lib` holds infrastructure, not a grab-bag.** Each subfolder is a single
  concern with an explicit public entry point:

  | Module               | Concern                                             |
  | -------------------- | --------------------------------------------------- |
  | `lib/result`         | Explicit success/failure `Result` type              |
  | `lib/errors`         | Application error taxonomy (codes → HTTP status)    |
  | `lib/logging`        | Structured, injectable logger                       |
  | `lib/env`            | Zod-validated environment parsing                   |
  | `lib/config`         | Typed application configuration derived from env    |
  | `lib/feature-flags`  | Configuration-driven feature flags                  |
  | `lib/validation`     | Zod → `Result`/`AppError` boundary validation       |
  | `lib/id`             | UUID and prefixed identifier generation             |
  | `lib/datetime`       | Pure, clock-injectable date utilities               |
  | `lib/tokens.ts`      | JS mirror of design tokens (breakpoints, z-index)   |

## Design tokens

`src/styles/tokens.css` is the single source of truth for color, radius,
elevation, motion, focus, and z-index. Components never hardcode raw values;
they consume tokens through Tailwind utilities (mapped in `globals.css`) or
`var(--token)`. The interface is dark-first, with `.light` as an explicit
opt-out.

## Testing strategy

- **Unit/component:** Vitest + Testing Library (`src/**/*.test.ts(x)`).
- **End-to-end:** Playwright against the production build (`e2e/`).
- Time and IO are injected (clocks, sinks) so tests stay deterministic.

## What is intentionally absent at this step

Authentication, database models, AI, uploads, transcripts, dashboards, and API
endpoints are **not** built yet. This step establishes only the foundation every
future feature relies on.
