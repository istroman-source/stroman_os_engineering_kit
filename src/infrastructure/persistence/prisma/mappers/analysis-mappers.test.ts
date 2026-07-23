import { describe, expect, it } from "vitest";
import type { AnalysisOutput, AnalysisRun } from "@prisma/client";
import { PersistenceMappingError } from "../errors";
import { toAnalysisOutput, toAnalysisRun } from "./analysis-mappers";

const run: AnalysisRun = {
  id: "anrun_00000001",
  ownerId: "usr_00000001",
  projectId: "proj_00000001",
  version: 1,
  status: "PENDING",
  failureReason: null,
  createdAt: new Date("2026-07-23T00:00:00Z"),
  startedAt: null,
  completedAt: null,
};
const output: AnalysisOutput = {
  id: "anout_00000001",
  analysisRunId: run.id,
  kind: "THEME",
  content: "Belonging",
  confidence: 0.8,
  createdAt: run.createdAt,
};

describe("analysis Prisma mappers", () => {
  it("maps valid runs and outputs", () => {
    expect(toAnalysisRun(run)).toMatchObject({ id: run.id, status: "PENDING" });
    expect(toAnalysisOutput({ ...output, evidence: [] })).toMatchObject({
      id: output.id,
      kind: "THEME",
    });
  });

  it.each([
    { ...run, id: "bad" },
    { ...run, version: 0 },
    { ...run, status: "COMPLETED" as const },
  ])("maps corrupt run rows to PersistenceMappingError", (row) => {
    expect(() => toAnalysisRun(row)).toThrow(PersistenceMappingError);
  });

  it("maps unknown output kinds to PersistenceMappingError", () => {
    expect(() => toAnalysisOutput({ ...output, kind: "UNKNOWN" as never, evidence: [] })).toThrow(
      PersistenceMappingError,
    );
  });
});
