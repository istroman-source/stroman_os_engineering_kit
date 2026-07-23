import type { CommandRunner } from "./types";
import { AutopilotError } from "./errors";
async function ok(r: CommandRunner, c: string[], code: string) {
  const x = await r.run(c);
  if (x.exitCode !== 0) throw new AutopilotError(x.stderr || `${c[0]} failed`, code);
  return x.stdout.trim();
}
export async function preflight(r: CommandRunner, root: string, dry = false) {
  for (const tool of ["git", "gh", "node", "npm"]) await ok(r, [tool, "--version"], "TOOL_MISSING");
  await ok(r, ["gh", "auth", "status"], "GH_AUTH_MISSING");
  await ok(r, ["gh", "repo", "view", "--json", "nameWithOwner"], "REPO_ACCESS_MISSING");
  if (await ok(r, ["git", "status", "--porcelain"], "GIT_STATUS_FAILED"))
    throw new AutopilotError("Working tree has uncommitted changes", "DIRTY_WORKTREE");
  const branch = await ok(r, ["git", "branch", "--show-current"], "GIT_BRANCH_FAILED");
  if (branch !== "main")
    throw new AutopilotError(`Start Autopilot on main, not ${branch}`, "NOT_MAIN");
  if (!dry) {
    await ok(r, ["git", "fetch", "--prune", "origin"], "SYNC_FAILED");
    await ok(r, ["git", "pull", "--ff-only", "origin", "main"], "SYNC_FAILED");
  }
}
