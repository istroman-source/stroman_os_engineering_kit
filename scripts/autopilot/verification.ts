import { resolve } from "node:path";
import type { CommandRunner, Config, VerificationOutcome } from "./types";
export async function verify(root: string, c: Config, r: CommandRunner, id: string) {
  const out: VerificationOutcome[] = [];
  for (const command of c.verificationCommands) {
    const log = resolve(root, `.autopilot/logs/${id}/verification.log`),
      x = await r.run(command, { cwd: root, logFile: log });
    out.push({
      command,
      status: x.exitCode === 0 ? "PASSED" : "FAILED",
      durationMs: x.durationMs,
      log,
      exitCode: x.exitCode,
    });
    if (x.exitCode !== 0) break;
  }
  return out;
}
