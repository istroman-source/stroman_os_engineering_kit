# Autopilot Architecture Decision

Use a repository-local TypeScript state machine with a thin executable wrapper. This
reuses Node, `tsx`, Zod, Vitest, Git, and GitHub CLI already required by Stroman OS.
Lifecycle policy is separated from process execution so safety and failure behavior can
be tested without touching real branches or pull requests. Runtime state and redacted
logs are local and gitignored; versioned JSON configuration contains no secrets.

Hosted orchestration and paid services are deliberately excluded. Agent execution is an
optional command adapter: unavailable adapters produce exact prompts and explicit waiting
states rather than fake automation. Independent review remains logically separate from
implementation and merge policy is enforced from structured state.
