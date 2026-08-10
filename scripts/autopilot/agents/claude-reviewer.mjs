#!/usr/bin/env node
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const promptPath = process.argv[2];

if (!promptPath) {
  console.error("A generated prompt-file path is required.");
  process.exit(2);
}

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
  const [prompt, schema] = await Promise.all([
    readFile(promptPath, "utf8"),
    readFile(join(scriptDirectory, "schemas", "review-result.schema.json"), "utf8"),
  ]);
  const result = await run(
    process.env.CLAUDE_BIN ?? "claude",
    [
      "-p",
      "--output-format",
      "json",
      "--json-schema",
      schema,
      "--permission-mode",
      "dontAsk",
      "--safe-mode",
      "--tools",
      "Read,Glob,Grep,Bash",
      "--allowedTools",
      "Read,Glob,Grep,Bash(git diff *),Bash(git show *),Bash(git status *),Bash(git log *),Bash(git rev-parse *)",
      "--disallowedTools",
      "Edit,Write,NotebookEdit",
      "--no-session-persistence",
    ],
    prompt,
  );
  if (result.exitCode !== 0) {
    console.error(result.stderr || result.stdout || `Claude exited ${result.exitCode}.`);
    process.exitCode = result.exitCode;
  } else {
    const envelope = JSON.parse(result.stdout);
    const review =
      typeof envelope.structured_output === "string"
        ? JSON.parse(envelope.structured_output)
        : envelope.structured_output;
    if (!review || typeof review !== "object")
      throw new Error("Claude did not return a structured review result.");
    process.stdout.write(`${JSON.stringify(review)}\n`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
