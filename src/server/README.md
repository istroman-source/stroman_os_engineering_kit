# Server layer

Server-only code: application services, data access, and authorization. Never
imported into the client bundle.

## Rules

- All workspace data reads/writes are **authorized on the server** (per the
  Software Requirements Specification).
- Implements interfaces owned by `src/domain`; provider SDKs (Prisma, AI) are
  confined to adapters here.
- Exposes typed **service contracts** to `src/app` and `src/ui`. Internals must
  not be imported by UI (enforced by ESLint via the `internal` path convention).

Empty by design at the foundation step — services and data access arrive in
later build steps (auth, persistence, AI infrastructure).
