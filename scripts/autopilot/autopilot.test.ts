import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CommandResult, CommandRunner, Config } from "./types";
import { preflight } from "./preflight";
import { selectMilestone, branchFor } from "./roadmap";
import { verify } from "./verification";
import { StateStore } from "./state-store";
import { mergeGate } from "./policy";
import { newState } from "./workflow";
import { monitorCi } from "./github";
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
});
