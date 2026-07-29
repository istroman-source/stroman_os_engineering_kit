import { spawn } from "node:child_process";
import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { CommandResult, CommandRunner } from "./types";
const ASSIGNMENT = /\b(token|secret|password|api[_-]?key|access[_-]?token)([=: ]+)([^\s"']+)/gi;
const AUTHORIZATION = /(authorization\s*:\s*)(?:bearer|basic)\s+[^\s]+/gi;
const BEARER = /\bbearer\s+[A-Za-z0-9._~+/=-]+/gi;
const COMMON_TOKENS =
  /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{16,}|sb_(?:secret|publishable)_[A-Za-z0-9_-]{16,})\b/g;
export const redact = (value: string) =>
  value
    .replace(AUTHORIZATION, "$1[REDACTED]")
    .replace(BEARER, "Bearer [REDACTED]")
    .replace(COMMON_TOKENS, "[REDACTED]")
    .replace(ASSIGNMENT, "$1$2[REDACTED]");
export class ProcessCommandRunner implements CommandRunner {
  async run(
    command: readonly string[],
    options: { cwd?: string; logFile?: string; timeoutMs?: number } = {},
  ): Promise<CommandResult> {
    const started = Date.now();
    return await new Promise((resolve, reject) => {
      const child = spawn(command[0]!, command.slice(1), {
        cwd: options.cwd,
        env: process.env,
        shell: false,
      });
      let stdout = "",
        stderr = "",
        timedOut = false;
      child.stdout.on("data", (c) => (stdout += String(c)));
      child.stderr.on("data", (c) => (stderr += String(c)));
      const timer = options.timeoutMs
        ? setTimeout(() => {
            timedOut = true;
            child.kill("SIGTERM");
          }, options.timeoutMs)
        : null;
      child.on("error", reject);
      child.on("close", async (code) => {
        if (timer) clearTimeout(timer);
        const result = {
          exitCode: timedOut ? 124 : (code ?? 1),
          stdout: redact(stdout),
          stderr: redact(stderr),
          durationMs: Date.now() - started,
        };
        if (options.logFile) {
          await mkdir(dirname(options.logFile), { recursive: true });
          await appendFile(
            options.logFile,
            redact(`$ ${command.join(" ")}\n${result.stdout}${result.stderr}\n`),
          );
        }
        resolve(result);
      });
    });
  }
}
