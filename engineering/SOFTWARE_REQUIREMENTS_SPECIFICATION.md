# Software Requirements Specification

## Functional requirements
- Multi-tenant workspaces with role-based server authorization.
- Projects, clients, brands, media assets, transcripts, evidence, analyses, decisions, reviews, exports, and lessons.
- Versioned, retryable AI analysis runs.
- Provider-neutral AI and external integration adapters.
- Evidence citations resolvable to authorized project sources.
- Human approval required for decisions and institutional lessons.

## Nonfunctional requirements
- Strict type safety and validated boundaries.
- Accessible keyboard-first dark-first interface targeting WCAG 2.2 AA.
- Auditable state transitions and significant mutations.
- Background execution for long AI or export work.
- Safe secrets, signed object access, workspace isolation, and explicit retention.
- Deterministic tests and AI evaluation fixtures.

## Reliability
Jobs are idempotent, bounded in retry, observable, and preserve previous successful results. Integration synchronization records provenance and partial failures.
