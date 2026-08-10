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
import { implementationPrompt, reviewPrompt } from "./prompts";
import { ProcessCommandRunner, redact } from "./command-runner";
import { agentFailureMessage } from "./agent-output";
import {
  assertRecordedBranch,
  enforceChangeSafety,
  applyReviewResult,
  mergeReady,
  parseReviewResult,
  requestIndependentReview,
} from "./lifecycle";
class FakeRunner implements CommandRunner {
  calls: string[][] = [];
  options: Array<{ cwd?: string; logFile?: string; timeoutMs?: number } | undefined> = [];
  constructor(readonly handler: (c: readonly string[]) => Partial<CommandResult> = () => ({})) {}
  async run(
    c: readonly string[],
    options?: { cwd?: string; logFile?: string; timeoutMs?: number },
  ) {
    this.calls.push([...c]);
    this.options.push(options);
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
  agentTimeoutSeconds: 10,
  ciTimeoutSeconds: 1,
  requiredCiChecks: ["CI"],
  remediationLoopLimit: 2,
  autoMerge: false,
  continuous: false,
  branchTemplate: "feat/{slug}",
  protectedPaths: [],
  approvalPolicies: [],
};
describe("Autopilot", () => {
  it("keeps structured-output schemas compatible with both agent CLIs", async () => {
    for (const name of ["implementation-result.schema.json", "review-result.schema.json"]) {
      const schema = JSON.parse(
        await readFile(join(import.meta.dirname, "agents", "schemas", name), "utf8"),
      );
      expect(schema).not.toHaveProperty("$schema");
      expect(schema).toMatchObject({ type: "object", additionalProperties: false });
    }
  });
  it("permanently evolves implementation prompts from review lessons", () => {
    const prompt = implementationPrompt(
      { id: "149", title: "Readiness", slug: "149-readiness", source: "prompt.md" },
      config,
    );
    expect(prompt).toContain("Prompt Evolution Rule (permanent)");
    expect(prompt).toContain("real delivery boundary");
    expect(prompt).toContain("negative-path coverage");
    expect(prompt).toContain("idempotency, concurrency, transactions, retries, and cleanup");
    expect(prompt).toContain("in-memory adapters behaviorally equivalent");
    expect(prompt).toContain("report NOT READY");
    expect(prompt).toContain("Do not commit, push, create a PR, merge, or change branches");
  });
  it("pins the independent review prompt to one exact commit", () => {
    const commit = "a".repeat(40);
    const prompt = reviewPrompt(
      22,
      { id: "149", title: "Readiness", slug: "149-readiness", source: "prompt.md" },
      commit,
    );
    expect(prompt).toContain(`exact head commit ${commit}`);
    expect(prompt).toContain(`Return reviewedCommit as exactly ${commit}`);
    expect(prompt).toContain("detached, read-only review worktree");
  });
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
  it("refuses to rerun a completed milestone", async () => {
    await expect(selectMilestone(await root(), config, "001")).rejects.toMatchObject({
      code: "MILESTONE_COMPLETE",
    });
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
      monitorCi(new FakeRunner(() => ({ exitCode: 1, stderr: "failed" })), 1, 1, "a".repeat(40), [
        "CI",
      ]),
    ).rejects.toMatchObject({ code: "CI_FAILED" });
  });
  it("passes only the complete required CI suite on the exact head", async () => {
    const commit = "a".repeat(40);
    const runner = new FakeRunner(() => ({
      stdout: JSON.stringify({
        headRefOid: commit,
        statusCheckRollup: [
          { __typename: "CheckRun", name: "CI", status: "COMPLETED", conclusion: "SUCCESS" },
          {
            __typename: "CheckRun",
            name: "E2E",
            status: "COMPLETED",
            conclusion: "SUCCESS",
          },
        ],
      }),
    }));
    await expect(monitorCi(runner, 1, 1, commit, ["CI", "E2E"])).resolves.toBeUndefined();
    expect(runner.options[0]?.timeoutMs).toBeGreaterThan(0);
    expect(runner.options[0]?.timeoutMs).toBeLessThanOrEqual(1_000);
  });
  it("does not pass an incomplete required CI suite", async () => {
    const commit = "a".repeat(40);
    const runner = new FakeRunner(() => ({
      stdout: JSON.stringify({
        headRefOid: commit,
        statusCheckRollup: [
          { __typename: "CheckRun", name: "CI", status: "COMPLETED", conclusion: "SUCCESS" },
        ],
      }),
    }));
    await expect(monitorCi(runner, 1, 0.001, commit, ["CI", "E2E"])).rejects.toMatchObject({
      code: "CI_TIMEOUT",
    });
  });
  it("enforces review and merge gates", () => {
    const s = newState(false, false);
    s.verification = [{ command: ["ok"], status: "PASSED", durationMs: 1, log: "x", exitCode: 0 }];
    s.ciStatus = "PASSED";
    s.reviewVerdict = "CHANGES_REQUIRED";
    s.findings = [{ severity: "IMPORTANT", summary: "x", file: "src/x.ts", line: 1 }];
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
    '{"reviewedCommit":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","verdict":"APPROVED","findings":[{"severity":"WRONG","summary":"x","file":null,"line":null}]}',
    '{"reviewedCommit":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","verdict":"APPROVED","findings":[{"severity":"IMPORTANT","file":null,"line":null}]}',
    '{"reviewedCommit":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","verdict":"MAYBE","findings":[]}',
    '{"reviewedCommit":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","verdict":"APPROVED","findings":[{"severity":"IMPORTANT","summary":"defect","file":"src/x.ts","line":1}]}',
  ])("rejects malformed review result %s", (raw) => {
    expect(() => parseReviewResult(raw)).toThrowError(
      expect.objectContaining({ code: "REVIEW_OUTPUT_INVALID" }),
    );
  });

  it("accepts a fully valid structured review result", () => {
    expect(
      parseReviewResult(
        '{"reviewedCommit":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","verdict":"APPROVED","findings":[{"severity":"OPTIONAL","summary":"Polish","file":"src/x.ts","line":1}]}',
      ),
    ).toMatchObject({
      reviewedCommit: "a".repeat(40),
      verdict: "APPROVED",
      findings: [{ file: "src/x.ts", line: 1 }],
    });
  });

  it("reviews a disposable worktree at the exact PR head", async () => {
    const r = await root();
    const commit = "a".repeat(40);
    const state = newState(false, false);
    state.branch = "feat/test";
    state.prNumber = 9;
    state.commit = commit;
    state.ciStatus = "PASSED";
    state.milestone = {
      id: "002",
      title: "Two",
      slug: "002-two",
      source: "prompts/v/002_two.md",
    };
    const runner = new FakeRunner((command) => {
      if (command[0] === "git" && command[1] === "branch") return { stdout: "feat/test\n" };
      if (command.includes("headRefOid")) return { stdout: `{"headRefOid":"${commit}"}` };
      if (command[0] === "reviewer")
        return {
          stdout: `{"reviewedCommit":"${commit}","verdict":"APPROVED","findings":[]}`,
        };
      return {};
    });
    const result = await requestIndependentReview(
      r,
      { ...config, reviewAgentCommand: ["reviewer"] },
      runner,
      state,
    );
    expect(result.phase).toBe("READY_TO_MERGE");
    expect(result.reviewedCommit).toBe(commit);
    expect(
      runner.calls.some(
        (command) => command[0] === "git" && command[1] === "worktree" && command[2] === "add",
      ),
    ).toBe(true);
    expect(
      runner.calls.some(
        (command) => command[0] === "git" && command[1] === "worktree" && command[2] === "remove",
      ),
    ).toBe(true);
  });

  it("refuses review when the PR head changed after CI", async () => {
    const state = newState(false, false);
    state.branch = "feat/test";
    state.prNumber = 9;
    state.commit = "a".repeat(40);
    state.ciStatus = "PASSED";
    state.milestone = {
      id: "002",
      title: "Two",
      slug: "002-two",
      source: "prompts/v/002_two.md",
    };
    const runner = new FakeRunner((command) => {
      if (command[0] === "git" && command[1] === "branch") return { stdout: "feat/test\n" };
      if (command.includes("headRefOid")) return { stdout: `{"headRefOid":"${"b".repeat(40)}"}` };
      return {};
    });
    await expect(requestIndependentReview(".", config, runner, state)).rejects.toMatchObject({
      code: "CI_STALE",
    });
    expect(runner.calls.some((command) => command[1] === "worktree")).toBe(false);
  });

  it("rejects a review that names a different commit", async () => {
    const commit = "a".repeat(40);
    const state = newState(false, false);
    state.branch = "feat/test";
    state.prNumber = 9;
    state.commit = commit;
    state.ciStatus = "PASSED";
    const runner = new FakeRunner((command) => {
      if (command[0] === "git" && command[1] === "branch") return { stdout: "feat/test\n" };
      if (command.includes("headRefOid")) return { stdout: `{"headRefOid":"${commit}"}` };
      return {};
    });
    await expect(
      applyReviewResult(
        ".",
        config,
        runner,
        state,
        `{"reviewedCommit":"${"b".repeat(40)}","verdict":"APPROVED","findings":[]}`,
      ),
    ).rejects.toMatchObject({ code: "REVIEW_STALE" });
  });

  it("persists remediation failures and approval gates", async () => {
    const r = await root();
    const commit = "a".repeat(40);
    const state = newState(false, false);
    state.branch = "feat/test";
    state.prNumber = 9;
    state.commit = commit;
    state.ciStatus = "PASSED";
    state.milestone = {
      id: "002",
      title: "Two",
      slug: "002-two",
      source: "prompts/v/002_two.md",
    };
    const runner = new FakeRunner((command) => {
      if (command[0] === "git" && command[1] === "branch") return { stdout: "feat/test\n" };
      if (command.includes("headRefOid")) return { stdout: `{"headRefOid":"${commit}"}` };
      if (command[0] === "git" && command[1] === "status") return { stdout: " M .env.local\n" };
      return {};
    });
    await expect(
      applyReviewResult(
        r,
        {
          ...config,
          implementationAgentCommand: ["fixer"],
          protectedPaths: [".env.local"],
        },
        runner,
        state,
        `{"reviewedCommit":"${commit}","verdict":"CHANGES_REQUIRED","findings":[{"severity":"IMPORTANT","summary":"Fix it","file":"src/x.ts","line":1}]}`,
      ),
    ).rejects.toMatchObject({ code: "PROTECTED_PATH" });
    await expect(new StateStore(r).load()).resolves.toMatchObject({
      phase: "FAILED",
      failure: "Protected path changed: .env.local",
      approvalGates: ["protected path changed: .env.local"],
    });
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

  it("surfaces a structured agent blocker as the failure message", () => {
    expect(
      agentFailureMessage(
        {
          stdout: JSON.stringify({
            status: "BLOCKED",
            summary: "Stopped",
            blocker: "Roadmap approval is required",
          }),
          stderr: "",
        },
        "Agent failed",
      ),
    ).toBe("Roadmap approval is required");
  });

  it("exercises both subprocess adapters against provider-shaped fake CLIs", async () => {
    const r = await root();
    const prompt = join(r, "prompt.txt");
    const fakeCodex = join(r, "fake-codex.mjs");
    const fakeClaude = join(r, "fake-claude.mjs");
    await writeFile(prompt, "Adapter smoke test");
    await writeFile(
      fakeCodex,
      `#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
const args = process.argv.slice(2);
const required = ["-s", "workspace-write", "-a", "never", "exec", "--ephemeral", "--ignore-user-config", "--ignore-rules", "--output-schema", "-o", "-"];
if (!required.every((value) => args.includes(value))) process.exit(11);
JSON.parse(readFileSync(args[args.indexOf("--output-schema") + 1], "utf8"));
process.stdin.resume();
process.stdin.on("end", () => writeFileSync(args[args.indexOf("-o") + 1], JSON.stringify({ status: "IMPLEMENTED", summary: "ok", blocker: null })));
`,
      { mode: 0o755 },
    );
    await writeFile(
      fakeClaude,
      `#!/usr/bin/env node
const args = process.argv.slice(2);
const required = ["-p", "--output-format", "json", "--json-schema", "--permission-mode", "dontAsk", "--safe-mode", "--tools", "--allowedTools", "--disallowedTools", "--no-session-persistence"];
if (!required.every((value) => args.includes(value))) process.exit(12);
JSON.parse(args[args.indexOf("--json-schema") + 1]);
process.stdin.resume();
process.stdin.on("end", () => process.stdout.write(JSON.stringify({ structured_output: { reviewedCommit: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", verdict: "APPROVED", findings: [] } })));
`,
      { mode: 0o755 },
    );
    const previousCodex = process.env.CODEX_BIN;
    const previousClaude = process.env.CLAUDE_BIN;
    process.env.CODEX_BIN = fakeCodex;
    process.env.CLAUDE_BIN = fakeClaude;
    try {
      const runner = new ProcessCommandRunner();
      const codex = await runner.run(
        [process.execPath, join(import.meta.dirname, "agents", "codex-agent.mjs"), prompt],
        { cwd: r },
      );
      const claude = await runner.run(
        [process.execPath, join(import.meta.dirname, "agents", "claude-reviewer.mjs"), prompt],
        { cwd: r },
      );
      expect(codex).toMatchObject({ exitCode: 0 });
      expect(JSON.parse(codex.stdout)).toMatchObject({ status: "IMPLEMENTED" });
      expect(claude).toMatchObject({ exitCode: 0 });
      expect(JSON.parse(claude.stdout)).toMatchObject({
        reviewedCommit: "a".repeat(40),
        verdict: "APPROVED",
      });
    } finally {
      if (previousCodex === undefined) delete process.env.CODEX_BIN;
      else process.env.CODEX_BIN = previousCodex;
      if (previousClaude === undefined) delete process.env.CLAUDE_BIN;
      else process.env.CLAUDE_BIN = previousClaude;
    }
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

  it("force-kills a subprocess that ignores the configured timeout", async () => {
    const result = await new ProcessCommandRunner().run(
      [
        process.execPath,
        "-e",
        `const {spawn}=require("node:child_process");spawn(process.execPath,["-e",'process.on("SIGTERM",()=>{});setInterval(()=>{},1000)'],{stdio:"inherit"});process.on("SIGTERM",()=>{});setInterval(()=>{},1000)`,
      ],
      { timeoutMs: 500 },
    );
    expect(result.exitCode).toBe(124);
    expect(result.durationMs).toBeGreaterThan(1_000);
    expect(result.durationMs).toBeLessThan(2_000);
  });

  it("does not resolve a Unix timeout while descendants can still mutate", async () => {
    if (process.platform === "win32") return;
    const r = await root();
    const marker = join(r, "orphan-marker");
    const grandchild = `const {writeFileSync}=require("node:fs");process.on("SIGTERM",()=>{});setTimeout(()=>writeFileSync(${JSON.stringify(marker)},"orphan"),1700);setInterval(()=>{},1000)`;
    const parent = `const {spawn}=require("node:child_process");spawn(process.execPath,["-e",${JSON.stringify(grandchild)}],{stdio:"ignore"});setInterval(()=>{},1000)`;
    const result = await new ProcessCommandRunner().run([process.execPath, "-e", parent], {
      timeoutMs: 500,
    });
    expect(result.exitCode).toBe(124);
    expect(result.durationMs).toBeGreaterThan(1_000);
    await new Promise((resolve) => setTimeout(resolve, 400));
    await expect(readFile(marker, "utf8")).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("pins merge to the independently reviewed PR head", async () => {
    const state = newState(false, false);
    state.branch = "feat/test";
    state.prNumber = 9;
    state.reviewedCommit = "a".repeat(40);
    state.commit = "a".repeat(40);
    const runner = new FakeRunner((command) => {
      if (command[0] === "git" && command[1] === "branch") return { stdout: "feat/test\n" };
      if (command.includes("mergeable,state"))
        return { stdout: '{"mergeable":"MERGEABLE","state":"OPEN"}' };
      if (command.includes("headRefOid")) return { stdout: `{"headRefOid":"${"b".repeat(40)}"}` };
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
    state.reviewedCommit = "a".repeat(40);
    state.commit = "a".repeat(40);
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
      if (command.includes("headRefOid")) return { stdout: `{"headRefOid":"${"a".repeat(40)}"}` };
      return {};
    });
    await mergeReady(r, config, runner, state, { manual: true });
    expect(runner.calls).toContainEqual([
      "gh",
      "pr",
      "merge",
      "9",
      "--merge",
      "--match-head-commit",
      "a".repeat(40),
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
