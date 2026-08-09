import type { CommandRunner } from "./types";
import { AutopilotError } from "./errors";

type CheckRun = {
  __typename: "CheckRun";
  name?: string;
  status?: string;
  conclusion?: string;
};
type StatusContext = {
  __typename: "StatusContext";
  context?: string;
  state?: string;
};
type Check = CheckRun | StatusContext;

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

function checkState(check: Check) {
  if (check.__typename === "StatusContext") {
    if (check.state === "SUCCESS") return "PASSED";
    if (check.state === "FAILURE" || check.state === "ERROR") return "FAILED";
    return "PENDING";
  }
  if (check.status !== "COMPLETED") return "PENDING";
  if (["SUCCESS", "NEUTRAL", "SKIPPED"].includes(check.conclusion ?? "")) return "PASSED";
  return "FAILED";
}

function checkName(check: Check) {
  return check.__typename === "StatusContext" ? check.context : check.name;
}

export async function monitorCi(
  runner: CommandRunner,
  pr: number,
  seconds: number,
  expectedCommit: string,
  requiredChecks: string[],
) {
  const deadline = Date.now() + seconds * 1000;
  while (Date.now() < deadline) {
    const result = await runner.run([
      "gh",
      "pr",
      "view",
      String(pr),
      "--json",
      "headRefOid,statusCheckRollup",
    ]);
    if (result.exitCode !== 0)
      throw new AutopilotError(result.stderr || "CI status could not be read", "CI_FAILED");
    const parsed = JSON.parse(result.stdout) as {
      headRefOid?: string;
      statusCheckRollup?: Check[];
    };
    if (parsed.headRefOid === expectedCommit) {
      const checks = parsed.statusCheckRollup ?? [];
      const states = checks.map(checkState);
      if (states.includes("FAILED"))
        throw new AutopilotError("CI failed for the expected PR head", "CI_FAILED");
      const requiredStates = requiredChecks.map((required) => {
        const check = checks.find((candidate) => checkName(candidate) === required);
        return check ? checkState(check) : "MISSING";
      });
      if (requiredStates.every((state) => state === "PASSED")) return;
    }
    await wait(Math.min(10_000, Math.max(1, deadline - Date.now())));
  }
  throw new AutopilotError("CI did not pass for the expected PR head in time", "CI_TIMEOUT");
}
