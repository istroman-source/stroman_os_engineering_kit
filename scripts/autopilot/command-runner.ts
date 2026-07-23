import { spawn } from "node:child_process";
import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { CommandResult, CommandRunner } from "./types";
const REDACT = /(token|secret|password|authorization)([=: ]+)([^\s]+)/gi;
export const redact = (value: string) => value.replace(REDACT, "$1$2[REDACTED]");
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
            `$ ${command.join(" ")}\n${result.stdout}${result.stderr}\n`,
          );
        }
        resolve(result);
      });
    });
  }
}
