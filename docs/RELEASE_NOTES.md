# Release Notes

## Prompt 017 — Database indexes and constraints (2026-08-10)

- PostgreSQL now rejects cross-owner relationships in legacy memory, story-reasoning, and
  knowledge-acquisition records.
- Knowledge observations must reference documents, acquisition runs, and sources belonging to
  the same owner and source lineage.
- Compound indexes now match owner/source/project list filters and deterministic creation-time
  ordering.
- No filmmaker-facing behavior or terminology changed; this is persistence hardening only.

Automated evidence: Prisma client generation passed, and focused real-PostgreSQL regression
coverage was added. Manual evidence: none required for this database-only milestone. Unverified
blocker in this sandbox: PostgreSQL startup is denied by the host's shared-memory policy, so the
migration and integration suite require Autopilot/CI verification.
