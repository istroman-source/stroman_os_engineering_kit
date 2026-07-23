import type { Config, Finding, Milestone } from "./types";
export const implementationPrompt = (m: Milestone, c: Config) =>
  `Implement ${m.id} — ${m.title}.\n\nAuthoritative scope: ${m.source}.\nPreserve provenance, ownership, project isolation, auditability, and source integrity. Do not expose backend intelligence concepts in filmmaker UI. Do not expand into later milestones. Update roadmap progress and release notes in this branch before verification.\n\nVerification: ${c.verificationCommands.map((v) => v.join(" ")).join("; ")}\nStop for: ${c.approvalPolicies.join(", ")}.\nCommit, push, and open a PR; do not merge before independent review.`;
export const reviewPrompt = (pr: number, m: Milestone) =>
  `Independently review PR #${pr} for ${m.id} — ${m.title}. Review only the PR diff. Classify findings as BLOCKING, IMPORTANT, or OPTIONAL and provide a final verdict. Do not modify code.`;
export const unresolvedObjectiveFindings = (f: Finding[]) =>
  f.filter((x) => !x.resolved && (x.severity === "BLOCKING" || x.severity === "IMPORTANT"));
