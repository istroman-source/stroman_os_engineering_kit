import { describe, expect, it } from "vitest";
import { OwnerId, ProjectId } from "@/domain/project";
import { InvalidStateTransitionError, InvalidValueError } from "@/domain/shared";
import {
  completeAnalysisRun,
  createAnalysisRun,
  failAnalysisRun,
  startAnalysisRun,
} from "./analysis-run";
import { AnalysisRunId } from "./ids";

const NOW = new Date("2026-07-23T01:30:00.000Z");

function create(version = 1) {
  return createAnalysisRun({
    id: AnalysisRunId.unsafe("anrun_00000001"),
    ownerId: OwnerId.unsafe("usr_00000001"),
    projectId: ProjectId.unsafe("proj_00000001"),
    version,
    now: NOW,
  });
}

describe("AnalysisRun", () => {
  it("requires a positive integer version", () => {
    const result = create(0);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidValueError);
  });

  it("moves through pending, running, and completed while preserving its version", () => {
    const created = create(2);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const started = startAnalysisRun(created.value, NOW);
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    const completed = completeAnalysisRun(started.value, NOW);
    expect(completed.ok).toBe(true);
    if (!completed.ok) return;
    expect(completed.value).toMatchObject({ version: 2, status: "COMPLETED" });
  });

  it("records a bounded failure reason only from a running analysis", () => {
    const created = create();
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const invalid = failAnalysisRun(created.value, "provider unavailable", NOW);
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.error).toBeInstanceOf(InvalidStateTransitionError);

    const started = startAnalysisRun(created.value, NOW);
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    const failed = failAnalysisRun(started.value, "provider unavailable", NOW);
    expect(failed.ok).toBe(true);
    if (failed.ok) expect(failed.value.failureReason).toBe("provider unavailable");
  });
});
