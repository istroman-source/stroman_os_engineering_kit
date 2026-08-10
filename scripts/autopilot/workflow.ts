import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { CommandRunner, Config, RunState } from "./types";
import { StateStore } from "./state-store";
import { preflight } from "./preflight";
import { approvedContinuousStopMilestone, branchFor, selectMilestone } from "./roadmap";
import { implementationPrompt } from "./prompts";
import { AutopilotError } from "./errors";
import { advanceImplemented, requestIndependentReview } from "./lifecycle";
import { agentFailureMessage } from "./agent-output";
export const newState = (continuous: boolean, dryRun: boolean): RunState => {
  const now = new Date().toISOString();
  return {
    version: 1,
    runId: randomUUID(),
    milestone: null,
    branch: null,
    commit: null,
    reviewedCommit: null,
    prNumber: null,
    prUrl: null,
    phase: "PREFLIGHT",
    verification: [],
    ciStatus: "NOT_RUN",
    reviewVerdict: "NOT_RUN",
    findings: [],
    remediationAttempts: 0,
    approvalGates: [],
    startedAt: now,
    updatedAt: now,
    completedAt: null,
    failure: null,
    continuous,
    dryRun,
  };
};

type WorkflowOptions = { milestone?: string; continuous?: boolean; dryRun?: boolean };

async function executeWorkflow(
  root: string,
  c: Config,
  r: CommandRunner,
  o: WorkflowOptions,
  store: StateStore,
) {
  const continuous = o.continuous ?? c.continuous;
  const s = newState(continuous, o.dryRun ?? false);
  try {
    await preflight(r, root, s.dryRun);
    if (!continuous && !s.dryRun && !o.milestone)
      throw new AutopilotError(
        "Choose one explicit milestone with --milestone before starting automation",
        "APPROVAL_REQUIRED",
      );
    s.milestone = await selectMilestone(root, c, o.milestone);
    s.branch = branchFor(c.branchTemplate, s.milestone);
    s.phase = "MILESTONE_SELECTED";
    await store.save(s);
    const collision = await r.run([
      "git",
      "show-ref",
      "--verify",
      "--quiet",
      `refs/heads/${s.branch}`,
    ]);
    if (collision.exitCode === 0)
      throw new AutopilotError(`Branch ${s.branch} already exists; use resume`, "BRANCH_COLLISION");
    const prompt = implementationPrompt(s.milestone, c),
      path = resolve(root, `.autopilot/runs/${s.runId}/implementation-prompt.txt`);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, prompt, { mode: 0o600 });
    if (s.dryRun) {
      s.phase = "AWAITING_IMPLEMENTATION";
      await store.save(s);
      return s;
    }
    const made = await r.run(["git", "checkout", "-b", s.branch]);
    if (made.exitCode !== 0) throw new AutopilotError(made.stderr, "BRANCH_CREATE_FAILED");
    if (!c.implementationAgentCommand) {
      s.phase = "AWAITING_IMPLEMENTATION";
      await store.save(s);
      return s;
    }
    s.phase = "IMPLEMENTING";
    await store.save(s);
    const result = await r.run([...c.implementationAgentCommand, path], {
      cwd: root,
      timeoutMs: c.agentTimeoutSeconds * 1000,
      logFile: resolve(root, `.autopilot/logs/${s.runId}/implementation.log`),
    });
    if (result.exitCode !== 0)
      throw new AutopilotError(
        agentFailureMessage(result, "Implementation agent failed"),
        "IMPLEMENTATION_FAILED",
      );
    return await advanceImplemented(root, c, r, s);
  } catch (e) {
    if (s.phase !== "AWAITING_REVIEW" && s.phase !== "READY_TO_MERGE") s.phase = "FAILED";
    s.failure = e instanceof Error ? e.message : String(e);
    await store.save(s);
    throw e;
  }
}

export async function startWorkflow(root: string, c: Config, r: CommandRunner, o: WorkflowOptions) {
  const store = new StateStore(root);
  await store.acquire();
  try {
    return await executeWorkflow(root, c, r, o, store);
  } finally {
    await store.release();
  }
}

export async function runWorkflow(
  root: string,
  c: Config,
  r: CommandRunner,
  o: WorkflowOptions,
  runMilestone?: typeof startWorkflow,
) {
  const continuous = o.continuous ?? c.continuous;
  if (!continuous) return await startWorkflow(root, c, r, { ...o, continuous: false });
  if (!c.autoMerge)
    throw new AutopilotError("Continuous mode requires auto-merge", "CONTINUOUS_UNSAFE");
  const stop = c.continuousStopAfterMilestone;
  if (!stop)
    throw new AutopilotError(
      "Continuous mode requires an explicit stop milestone",
      "CONTINUOUS_UNBOUNDED",
    );
  const approvedStop = await approvedContinuousStopMilestone(root, c);
  if (stop !== approvedStop)
    throw new AutopilotError(
      `Configured stop milestone ${stop} does not match roadmap approval ${approvedStop}`,
      "CONTINUOUS_TARGET_MISMATCH",
    );
  if (o.milestone && o.milestone.padStart(3, "0") > stop)
    throw new AutopilotError(
      `Milestone ${o.milestone} is beyond the continuous stop milestone ${stop}`,
      "CONTINUOUS_TARGET_EXCEEDED",
    );

  const store = new StateStore(root);
  await store.acquire();
  try {
    let milestone = o.milestone;
    while (true) {
      const next = await selectMilestone(root, c, milestone);
      if (next.id > stop) {
        const previous = await store.load();
        if (previous?.phase === "COMPLETE" && previous.milestone?.id === stop) return previous;
        throw new AutopilotError(
          `Next milestone ${next.id} is beyond the continuous stop milestone ${stop}`,
          "CONTINUOUS_TARGET_REACHED",
        );
      }
      const state = runMilestone
        ? await runMilestone(root, c, r, { ...o, milestone: next.id, continuous: true })
        : await executeWorkflow(root, c, r, { ...o, milestone: next.id, continuous: true }, store);
      if (o.dryRun || state.phase !== "COMPLETE" || state.milestone?.id === stop) return state;
      milestone = undefined;
    }
  } finally {
    await store.release();
  }
}
export async function prepareReview(root: string, c: Config, r: CommandRunner) {
  const store = new StateStore(root),
    s = await store.load();
  if (!s?.milestone || !s.prNumber)
    throw new AutopilotError("No PR is ready for review", "REVIEW_NOT_READY");
  return await requestIndependentReview(root, c, r, s);
}
