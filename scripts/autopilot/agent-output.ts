import type { CommandResult } from "./types";

export function agentFailureMessage(
  result: Pick<CommandResult, "stdout" | "stderr">,
  fallback: string,
) {
  try {
    const structured = JSON.parse(result.stdout) as { blocker?: unknown; summary?: unknown };
    if (typeof structured.blocker === "string" && structured.blocker.trim())
      return structured.blocker.trim();
    if (typeof structured.summary === "string" && structured.summary.trim())
      return structured.summary.trim();
  } catch {
    // Fall through to ordinary stderr/stdout handling for non-JSON adapters.
  }
  return result.stderr.trim() || result.stdout.trim() || fallback;
}
