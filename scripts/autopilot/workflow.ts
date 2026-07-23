import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { CommandRunner, Config, RunState } from "./types";
import { StateStore } from "./state-store";
import { preflight } from "./preflight";
import { branchFor, selectMilestone } from "./roadmap";
import { implementationPrompt, reviewPrompt } from "./prompts";
import { AutopilotError } from "./errors";
import { advanceImplemented } from "./lifecycle";
export const newState = (continuous: boolean, dryRun: boolean): RunState => {
  const now = new Date().toISOString();
  return {
    version: 1,
    runId: randomUUID(),
    milestone: null,
    branch: null,
    commit: null,
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
export async function startWorkflow(
  root: string,
  c: Config,
  r: CommandRunner,
  o: { milestone?: string; continuous?: boolean; dryRun?: boolean },
) {
  const store = new StateStore(root);
  await store.acquire();
  const s = newState(o.continuous ?? c.continuous, o.dryRun ?? false);
  try {
    await preflight(r, root, s.dryRun);
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
    const result = await r.run([...c.implementationAgentCommand, path]);
    if (result.exitCode !== 0) throw new AutopilotError(result.stderr, "IMPLEMENTATION_FAILED");
    return await advanceImplemented(root, c, r, s);
  } catch (e) {
    s.phase = "FAILED";
    s.failure = e instanceof Error ? e.message : String(e);
    await store.save(s);
    throw e;
  } finally {
    await store.release();
  }
}
export async function prepareReview(root: string, c: Config, r: CommandRunner) {
  const store = new StateStore(root),
    s = await store.load();
  if (!s?.milestone || !s.prNumber)
    throw new AutopilotError("No PR is ready for review", "REVIEW_NOT_READY");
  const prompt = reviewPrompt(s.prNumber, s.milestone),
    path = resolve(root, `.autopilot/runs/${s.runId}/review-prompt.txt`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, prompt, { mode: 0o600 });
  if (c.reviewAgentCommand) {
    const result = await r.run([...c.reviewAgentCommand, path]);
    if (result.exitCode !== 0) throw new AutopilotError(result.stderr, "REVIEW_FAILED");
  }
  s.phase = "AWAITING_REVIEW";
  await store.save(s);
  return s;
}
