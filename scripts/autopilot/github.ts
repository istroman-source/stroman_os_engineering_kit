import type { CommandRunner } from "./types";
import { AutopilotError } from "./errors";
export async function monitorCi(r: CommandRunner, pr: number, seconds: number) {
  const x = await r.run(["gh", "pr", "checks", String(pr), "--watch", "--interval", "10"], {
    timeoutMs: seconds * 1000,
  });
  if (x.exitCode !== 0)
    throw new AutopilotError(
      x.stderr || "CI failed or timed out",
      x.exitCode === 124 ? "CI_TIMEOUT" : "CI_FAILED",
    );
}
