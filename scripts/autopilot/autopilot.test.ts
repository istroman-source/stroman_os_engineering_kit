import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CommandResult, CommandRunner, Config } from "./types";
import { preflight } from "./preflight";
import { selectMilestone, branchFor } from "./roadmap";
import { verify } from "./verification";
import { StateStore, withLock } from "./state-store";
import { mergeGate } from "./policy";
import { newState } from "./workflow";
import { monitorCi } from "./github";
import { ProcessCommandRunner, redact } from "./command-runner";
import {
  assertRecordedBranch,
  enforceChangeSafety,
  mergeReady,
  parseReviewResult,
} from "./lifecycle";
class FakeRunner implements CommandRunner {
  calls: string[][] = [];
  constructor(readonly handler: (c: readonly string[]) => Partial<CommandResult> = () => ({})) {}
  async run(c: readonly string[]) {
    this.calls.push([...c]);
    return { exitCode: 0, stdout: "", stderr: "", durationMs: 1, ...this.handler(c) };
  }
}
const roots: string[] = [];
async function root() {
  const r = await mkdtemp(join(tmpdir(), "autopilot-"));
  roots.push(r);
  await mkdir(join(r, "prompts/v"), { recursive: true });
  await mkdir(join(r, "docs"));
  await mkdir(join(r, "roadmap"));
  await writeFile(join(r, "prompts/v/001_one.md"), "# Prompt 001 — One\n");
  await writeFile(join(r, "prompts/v/002_two.md"), "# Prompt 002 — Two\n");
  await writeFile(join(r, "docs/progress.md"), "## Prompt 001 — One\n");
  await writeFile(join(r, "roadmap/roadmap.md"), "# Roadmap\n");
  return r;
}
afterEach(async () => {
  await Promise.all(roots.splice(0).map((r) => rm(r, { recursive: true, force: true })));
});
const config: Config = {
  version: 1,
  roadmapFile: "roadmap/roadmap.md",
  progressFile: "docs/progress.md",
  releaseNotesFile: "docs/progress.md",
  promptDirectories: ["prompts"],
  verificationCommands: [["ok"], ["next"]],
  implementationAgentCommand: null,
  reviewAgentCommand: null,
  ciTimeoutSeconds: 1,
  remediationLoopLimit: 2,
  autoMerge: false,
  continuous: false,
  branchTemplate: "feat/{slug}",
  protectedPaths: [],
  approvalPolicies: [],
};
describe("Autopilot", () => {
  it("passes clean preflight", async () => {
    const r = new FakeRunner((c) =>
      c[0] === "git" && c[1] === "branch" ? { stdout: "main\n" } : {},
    );
    await expect(preflight(r, ".", true)).resolves.toBeUndefined();
  });
  it("refuses a dirty tree", async () => {
    const r = new FakeRunner((c) =>
      c[1] === "status" ? { stdout: " M file\n" } : c[1] === "branch" ? { stdout: "main\n" } : {},
    );
    await expect(preflight(r, ".", true)).rejects.toMatchObject({ code: "DIRTY_WORKTREE" });
  });
  it("reports missing GitHub auth", async () => {
    const r = new FakeRunner((c) =>
      c[0] === "gh" && c[1] === "auth" ? { exitCode: 1, stderr: "not logged in" } : {},
    );
    await expect(preflight(r, ".", true)).rejects.toMatchObject({ code: "GH_AUTH_MISSING" });
  });
  it("selects the next incomplete milestone", async () => {
    expect((await selectMilestone(await root(), config)).id).toBe("002");
  });
  it("prevents skipping prerequisites", async () => {
    const r = await root();
    await writeFile(join(r, "prompts/v/003_three.md"), "# Prompt 003 — Three\n");
    await expect(selectMilestone(r, config, "003")).rejects.toMatchObject({
      code: "APPROVAL_REQUIRED",
    });
  });
  it("creates deterministic branch names", () => {
    expect(
      branchFor("feat/{slug}", { id: "002", title: "Two", slug: "002-two", source: "x" }),
    ).toBe("feat/002-two");
  });
  it("records verification success", async () => {
    const out = await verify(await root(), config, new FakeRunner(), "r");
    expect(out.map((x) => x.status)).toEqual(["PASSED", "PASSED"]);
  });
  it("fails verification fast", async () => {
    const r = new FakeRunner((c) => (c[0] === "ok" ? { exitCode: 1 } : {}));
    const out = await verify(await root(), config, r, "r");
    expect(out).toHaveLength(1);
    expect(out[0]?.status).toBe("FAILED");
  });
  it("persists interrupted state for resume", async () => {
    const r = await root(),
      store = new StateStore(r),
      s = newState(false, false);
    s.phase = "VERIFYING";
    await store.save(s);
    expect((await store.load())?.phase).toBe("VERIFYING");
  });
  it("rejects CI failure", async () => {
    await expect(
      monitorCi(new FakeRunner(() => ({ exitCode: 1, stderr: "failed" })), 1, 1),
    ).rejects.toMatchObject({ code: "CI_FAILED" });
  });
  it("enforces review and merge gates", () => {
    const s = newState(false, false);
    s.verification = [{ command: ["ok"], status: "PASSED", durationMs: 1, log: "x", exitCode: 0 }];
    s.ciStatus = "PASSED";
    s.reviewVerdict = "CHANGES_REQUIRED";
    s.findings = [{ severity: "IMPORTANT", summary: "x", resolved: false }];
    expect(mergeGate(s, true)).toContain("independent review not approved");
  });
  it("caps remediation through configured state", () => {
    const s = newState(false, false);
    s.remediationAttempts = config.remediationLoopLimit;
    expect(s.remediationAttempts).toBe(2);
  });
  it("permits merge only with every gate green", () => {
    const s = newState(false, false);
    s.verification = [{ command: ["ok"], status: "PASSED", durationMs: 1, log: "x", exitCode: 0 }];
    s.ciStatus = "PASSED";
    s.reviewVerdict = "APPROVED";
    expect(mergeGate(s, true)).toEqual([]);
  });
  it("cleans state without deleting work", async () => {
    const r = await root(),
      store = new StateStore(r),
      s = newState(false, false);
    await store.save(s);
    await store.clear();
    expect(await store.load()).toBeNull();
  });
  it("models dry runs without mutations", () => {
    expect(newState(false, true).dryRun).toBe(true);
  });
  it("prevents concurrent runs", async () => {
    const r = await root(),
      a = new StateStore(r),
      b = new StateStore(r);
    await a.acquire();
    await expect(b.acquire()).rejects.toMatchObject({ code: "LOCKED" });
    await a.release();
  });
  it("stores machine-readable state", async () => {
    const r = await root(),
      store = new StateStore(r),
      s = newState(false, false);
    await store.save(s);
    expect(JSON.parse(await readFile(store.statePath, "utf8")).runId).toBe(s.runId);
  });

  it("detects destructive tracked migrations before commit", async () => {
    const r = await root();
    const path = join(r, "prisma/migrations/001_bad");
    await mkdir(path, { recursive: true });
    await writeFile(join(path, "migration.sql"), "DROP TABLE projects;");
    const runner = new FakeRunner((command) =>
      command[1] === "status" ? { stdout: " M prisma/migrations/001_bad/migration.sql\n" } : {},
    );
    await expect(
      enforceChangeSafety(r, config, runner, newState(false, false)),
    ).rejects.toMatchObject({ code: "APPROVAL_REQUIRED" });
  });

  it("detects destructive untracked migrations before commit", async () => {
    const r = await root();
    const path = join(r, "prisma/migrations/002_new");
    await mkdir(path, { recursive: true });
    await writeFile(join(path, "migration.sql"), "TRUNCATE projects;");
    const runner = new FakeRunner((command) =>
      command[1] === "status" ? { stdout: "?? prisma/migrations/002_new/migration.sql\n" } : {},
    );
    await expect(
      enforceChangeSafety(r, config, runner, newState(false, false)),
    ).rejects.toMatchObject({ code: "APPROVAL_REQUIRED" });
  });

  it("enforces configured protected paths", async () => {
    const r = await root();
    const runner = new FakeRunner((command) =>
      command[1] === "status" ? { stdout: " M .env.local\n" } : {},
    );
    await expect(
      enforceChangeSafety(
        r,
        { ...config, protectedPaths: [".env.local"] },
        runner,
        newState(false, false),
      ),
    ).rejects.toMatchObject({ code: "PROTECTED_PATH" });
  });

  it("refuses a recorded branch mismatch", async () => {
    const state = newState(false, false);
    state.branch = "feat/expected";
    await expect(
      assertRecordedBranch(new FakeRunner(() => ({ stdout: "feat/other\n" })), state),
    ).rejects.toMatchObject({ code: "BRANCH_MISMATCH" });
  });

  it("prevents dry-run state from mutating", async () => {
    const state = newState(false, true);
    state.branch = "feat/expected";
    await expect(assertRecordedBranch(new FakeRunner(), state)).rejects.toMatchObject({
      code: "DRY_RUN_MUTATION",
    });
  });

  it.each([
    "not json",
    '{"verdict":"APPROVED","findings":[{"severity":"WRONG","summary":"x","resolved":false}]}',
    '{"verdict":"APPROVED","findings":[{"severity":"IMPORTANT","resolved":false}]}',
    '{"verdict":"MAYBE","findings":[]}',
  ])("rejects malformed review result %s", (raw) => {
    expect(() => parseReviewResult(raw)).toThrowError(
      expect.objectContaining({ code: "REVIEW_OUTPUT_INVALID" }),
    );
  });

  it("accepts a fully valid structured review result", () => {
    expect(
      parseReviewResult(
        '{"verdict":"APPROVED","findings":[{"severity":"OPTIONAL","summary":"Polish","resolved":false}]}',
      ),
    ).toMatchObject({ verdict: "APPROVED" });
  });

  it("redacts authorization, bearer, GitHub, and API tokens", () => {
    const secrets = [
      "Authorization: Bearer abc.def.ghi",
      "Bearer another-token-value",
      "ghp_123456789012345678901234567890",
      "github_pat_123456789012345678901234567890",
      "sk-123456789012345678901234",
      "api_key=plain-secret-value",
    ];
    const output = redact(secrets.join("\n"));
    for (const secret of [
      "abc.def.ghi",
      "another-token-value",
      "ghp_123456",
      "github_pat_123456",
      "sk-123456",
      "plain-secret-value",
    ])
      expect(output).not.toContain(secret);
  });

  it("never writes command or output secrets to logs", async () => {
    const r = await root();
    const log = join(r, "command.log");
    const secret = "ghp_123456789012345678901234567890";
    await new ProcessCommandRunner().run(
      [process.execPath, "-e", "process.stdout.write(process.argv[1])", secret],
      { logFile: log },
    );
    const contents = await readFile(log, "utf8");
    expect(contents).not.toContain(secret);
    expect(contents).toContain("[REDACTED]");
  });

  it("pins merge to the independently reviewed PR head", async () => {
    const state = newState(false, false);
    state.branch = "feat/test";
    state.prNumber = 9;
    state.reviewedCommit = "old-sha";
    const runner = new FakeRunner((command) => {
      if (command[0] === "git" && command[1] === "branch") return { stdout: "feat/test\n" };
      if (command.includes("mergeable,state"))
        return { stdout: '{"mergeable":"MERGEABLE","state":"OPEN"}' };
      if (command.includes("headRefOid")) return { stdout: '{"headRefOid":"new-sha"}' };
      return {};
    });
    await expect(
      mergeReady(".", { ...config, autoMerge: true }, runner, state),
    ).rejects.toMatchObject({ code: "REVIEW_STALE" });
  });

  it("atomically matches the reviewed commit when merging", async () => {
    const r = await root();
    const state = newState(false, false);
    state.branch = "feat/test";
    state.prNumber = 9;
    state.reviewedCommit = "reviewed-sha";
    state.phase = "READY_TO_MERGE";
    state.ciStatus = "PASSED";
    state.reviewVerdict = "APPROVED";
    state.verification = [
      { command: ["ok"], status: "PASSED", durationMs: 1, log: "x", exitCode: 0 },
    ];
    const runner = new FakeRunner((command) => {
      if (command[0] === "git" && command[1] === "branch" && command[2] === "--show-current")
        return { stdout: "feat/test\n" };
      if (command.includes("mergeable,state"))
        return { stdout: '{"mergeable":"MERGEABLE","state":"OPEN"}' };
      if (command.includes("headRefOid")) return { stdout: '{"headRefOid":"reviewed-sha"}' };
      return {};
    });
    await mergeReady(r, { ...config, autoMerge: true }, runner, state);
    expect(runner.calls).toContainEqual([
      "gh",
      "pr",
      "merge",
      "9",
      "--merge",
      "--delete-branch",
      "--match-head-commit",
      "reviewed-sha",
    ]);
  });

  it("holds a lock for state-mutating command work", async () => {
    const r = await root();
    const first = new StateStore(r);
    const second = new StateStore(r);
    await withLock(first, async () => {
      await expect(withLock(second, async () => undefined)).rejects.toMatchObject({
        code: "LOCKED",
      });
    });
  });
});
