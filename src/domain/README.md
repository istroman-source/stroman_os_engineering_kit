# Domain layer

Pure business logic and types for Stroman OS. This is the innermost layer — all
other layers may depend on it; it depends on nothing but itself.

## Rules (enforced by ESLint)

- **No framework imports** (React, Next).
- **No provider/IO imports** (Prisma, AI SDKs, `fetch`, filesystem).
- **No UI or server imports** (`@/ui`, `@/app`, `@/server`).

If domain code needs an external capability, it declares an **interface** here
and an adapter in `src/server` implements it. This keeps the core portable and
fast to test.

Empty by design at the foundation step — domain models arrive in later build
steps (see the kit's domain-model prompts).

## Standing invariants

- **Knowledge provenance.** Every accepted Memory, Insight, Entity, or
  Relationship must always be traceable back to one or more originating Knowledge
  Observations (`src/domain/knowledge-acquisition`). Extraction never writes into
  the Creative Memory Engine directly; knowledge enters only through human review
  of observations, and the future materialization stage must preserve this link
  (a single observation may materialize into one or more Memory Engine records).
