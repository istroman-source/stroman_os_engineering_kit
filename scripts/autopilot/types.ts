export type Phase =
  | "PREFLIGHT"
  | "MILESTONE_SELECTED"
  | "AWAITING_IMPLEMENTATION"
  | "IMPLEMENTING"
  | "VERIFYING"
  | "VERIFIED"
  | "PR_OPEN"
  | "CI_PENDING"
  | "AWAITING_REVIEW"
  | "REMEDIATING"
  | "READY_TO_MERGE"
  | "MERGED"
  | "COMPLETE"
  | "FAILED"
  | "ABORTED";
export interface Milestone {
  id: string;
  title: string;
  slug: string;
  source: string;
}
export interface Finding {
  severity: "BLOCKING" | "IMPORTANT" | "OPTIONAL";
  summary: string;
  resolved: boolean;
}
export interface VerificationOutcome {
  command: readonly string[];
  status: "PASSED" | "FAILED";
  durationMs: number;
  log: string;
  exitCode: number;
}
export interface RunState {
  version: 1;
  runId: string;
  milestone: Milestone | null;
  branch: string | null;
  commit: string | null;
  reviewedCommit: string | null;
  prNumber: number | null;
  prUrl: string | null;
  phase: Phase;
  verification: VerificationOutcome[];
  ciStatus: "NOT_RUN" | "PENDING" | "PASSED" | "FAILED";
  reviewVerdict: "NOT_RUN" | "APPROVED" | "CHANGES_REQUIRED";
  findings: Finding[];
  remediationAttempts: number;
  approvalGates: string[];
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  failure: string | null;
  continuous: boolean;
  dryRun: boolean;
}
export interface Config {
  version: 1;
  roadmapFile: string;
  progressFile: string;
  releaseNotesFile: string;
  promptDirectories: string[];
  verificationCommands: string[][];
  implementationAgentCommand: string[] | null;
  reviewAgentCommand: string[] | null;
  ciTimeoutSeconds: number;
  remediationLoopLimit: number;
  autoMerge: boolean;
  continuous: boolean;
  branchTemplate: string;
  protectedPaths: string[];
  approvalPolicies: string[];
}
export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}
export interface CommandRunner {
  run(
    command: readonly string[],
    options?: { cwd?: string; logFile?: string; timeoutMs?: number },
  ): Promise<CommandResult>;
}
