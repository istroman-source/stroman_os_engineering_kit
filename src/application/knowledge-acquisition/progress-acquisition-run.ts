import { OptimisticConcurrencyError } from "@/lib/errors";
import { err, ok } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import {
  completeRun,
  failRun,
  startRun,
  type AcquisitionRunId,
  type AcquisitionRunOutcome,
  type AcquisitionRunRepository,
  type RunSummaryInput,
} from "@/domain/knowledge-acquisition";
import type { Clock } from "../shared";
import { attemptUpdate } from "../shared/attempt";
import { loadOwnedAcquisitionRun } from "./knowledge-source-access";
import { toAcquisitionRunView } from "./knowledge-acquisition-view";
export async function progressAcquisitionRun(
  deps: { acquisitionRuns: AcquisitionRunRepository; clock: Clock },
  input: { actorId: OwnerId; acquisitionRunId: AcquisitionRunId; expectedVersion: number } & (
    | { action: "start" }
    | { action: "fail" }
    | { action: "complete"; status: AcquisitionRunOutcome; summary: RunSummaryInput }
  ),
) {
  const loaded = await loadOwnedAcquisitionRun(
    deps.acquisitionRuns,
    input.actorId,
    input.acquisitionRunId,
    `acquisitionRun.${input.action}`,
  );
  if (!loaded.ok) return loaded;
  if (loaded.value.lockVersion !== input.expectedVersion)
    return err(new OptimisticConcurrencyError());
  const now = deps.clock.now();
  const made =
    input.action === "start"
      ? startRun(loaded.value, now)
      : input.action === "fail"
        ? failRun(loaded.value, now)
        : completeRun(loaded.value, { status: input.status, summary: input.summary, now });
  if (!made.ok) return made;
  const saved = await attemptUpdate(`acquisitionRun.${input.action}`, () =>
    deps.acquisitionRuns.update(made.value),
  );
  return saved.ok ? ok(toAcquisitionRunView(made.value)) : saved;
}
