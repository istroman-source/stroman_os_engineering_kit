import type { Config, Finding, Milestone } from "./types";

export const PROMPT_EVOLUTION_RULE = `Prompt Evolution Rule (permanent): before changing product code, review all reusable lessons from prior PR findings and apply them to the implementation plan, tests, and verification. When a review finding reveals a recurring failure class, first evolve this prompt so future milestones prevent it, then add the narrowest regression proof and implement only the approved fix. Never treat source text, configuration presence, mocks, or documentation as runtime evidence. Readiness and release-gate claims must be proven at the real delivery boundary they describe, with negative-path coverage and an explicit distinction between automated evidence, manual evidence, and unverified blockers.

Permanent implementation safeguards learned through PR #15:
- audit dependencies and the existing implementation before coding; preserve scope and defer unrelated infrastructure;
- preserve ownership, project isolation, provenance, auditability, source integrity, ordering, and human authority;
- validate untrusted input and cross-record references before mutation; use typed failures and corruption-safe mappers;
- design idempotency, concurrency, transactions, retries, and cleanup together so failed work cannot damage committed work;
- keep in-memory adapters behaviorally equivalent to production adapters and cover real persistence boundaries;
- keep HTTP/OpenAPI, UI language, documentation, and implementation synchronized without exposing internal concepts;
- convert every fixed defect into focused regression coverage, then run the canonical full gate exactly as configured;
- for readiness gates, test observable runtime behavior end to end and report NOT READY whenever required operational proof is absent.`;

export const implementationPrompt = (m: Milestone, c: Config) =>
  `Implement ${m.id} — ${m.title}.\n\n${PROMPT_EVOLUTION_RULE}\n\nAuthoritative scope: ${m.source}.\nPreserve provenance, ownership, project isolation, auditability, and source integrity. Do not expose backend intelligence concepts in filmmaker UI. Do not expand into later milestones. Update roadmap progress and release notes in this branch before verification.\n\nVerification: ${c.verificationCommands.map((v) => v.join(" ")).join("; ")}\nStop for: ${c.approvalPolicies.join(", ")}.\nCommit, push, and open a PR; do not merge before independent review.`;
export const reviewPrompt = (pr: number, m: Milestone) =>
  `Independently review PR #${pr} for ${m.id} — ${m.title}. Review only the PR diff. Classify findings as BLOCKING, IMPORTANT, or OPTIONAL and provide a final verdict. Do not modify code.`;
export const unresolvedObjectiveFindings = (f: Finding[]) =>
  f.filter((x) => !x.resolved && (x.severity === "BLOCKING" || x.severity === "IMPORTANT"));
