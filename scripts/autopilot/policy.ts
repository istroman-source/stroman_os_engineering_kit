import type { RunState } from "./types";
import { unresolvedObjectiveFindings } from "./prompts";
export function mergeGate(s: RunState, mergeable: boolean) {
  const r: string[] = [];
  if (!s.verification.length || s.verification.some((v) => v.status !== "PASSED"))
    r.push("local verification not passed");
  if (s.ciStatus !== "PASSED") r.push("CI not passed");
  if (s.reviewVerdict !== "APPROVED") r.push("independent review not approved");
  if (unresolvedObjectiveFindings(s.findings).length)
    r.push("objective review findings unresolved");
  if (!mergeable) r.push("PR not mergeable");
  if (s.approvalGates.length) r.push("human approval pending");
  return r;
}
