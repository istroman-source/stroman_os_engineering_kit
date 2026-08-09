#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const promptPath = process.argv[2];

if (!promptPath) {
  console.error("A generated prompt-file path is required.");
  process.exit(2);
}

const schemaPath = join(scriptDirectory, "schemas", "implementation-result.schema.json");
const outputPath = join(
  root,
  ".autopilot",
  "agent-results",
  `codex-${process.pid}-${Date.now()}.json`,
);

let activeChild;
process.once("SIGTERM", () => {
  activeChild?.kill("SIGTERM");
  setTimeout(() => activeChild?.kill("SIGKILL"), 5_000).unref();
});

function run(command, args, stdin) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, env: process.env, shell: false });
    activeChild = child;
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += String(chunk)));
    child.stderr.on("data", (chunk) => (stderr += String(chunk)));
    child.once("error", reject);
    child.once("close", (exitCode) => resolve({ exitCode: exitCode ?? 1, stdout, stderr }));
    child.stdin.end(stdin);
  });
}

try {
  const prompt = await readFile(promptPath, "utf8");
  await mkdir(dirname(outputPath), { recursive: true });
  const result = await run(
    process.env.CODEX_BIN ?? "codex",
    [
      "-s",
      "workspace-write",
      "-a",
      "never",
      "-C",
      root,
      "exec",
      "--ephemeral",
      "--ignore-user-config",
      "--ignore-rules",
      "--output-schema",
      schemaPath,
      "-o",
      outputPath,
      "-",
    ],
    prompt,
  );
  if (result.exitCode !== 0) {
    console.error(result.stderr || result.stdout || `Codex exited ${result.exitCode}.`);
    process.exitCode = result.exitCode;
  } else {
    const parsed = JSON.parse(await readFile(outputPath, "utf8"));
    if (
      !["IMPLEMENTED", "BLOCKED"].includes(parsed.status) ||
      typeof parsed.summary !== "string" ||
      !(typeof parsed.blocker === "string" || parsed.blocker === null)
    ) {
      throw new Error("Codex returned an invalid implementation result.");
    }
    process.stdout.write(`${JSON.stringify(parsed)}\n`);
    if (parsed.status === "BLOCKED") process.exitCode = 3;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await rm(outputPath, { force: true });
}
