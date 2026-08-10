# Release Notes

## Prompt 017 — Database indexes and constraints (2026-08-10)

- PostgreSQL now rejects cross-owner relationships in legacy memory, story-reasoning, and
  knowledge-acquisition records.
- Knowledge observations must reference documents, acquisition runs, and sources belonging to
  the same owner and source lineage.
- Compound indexes now match owner/source/project list filters and deterministic creation-time
  ordering; knowledge-observation alignment indexes use explicit PostgreSQL-safe catalog names.
- No filmmaker-facing behavior or terminology changed; this is persistence hardening only.

Automated evidence: the Autopilot host gate passed Prisma formatting and generation,
typecheck, lint, format check, unit tests, real-PostgreSQL integration tests, production build,
and diff validation after remediation. The database suite checks every owner-aligned foreign
key and the exact alignment-index catalog names. Exact-head CI passed, independent Claude
review approved the remediated commit with only OPTIONAL findings, and post-merge `main` CI
passed. Manual SQL inspection is not represented as runtime proof.
