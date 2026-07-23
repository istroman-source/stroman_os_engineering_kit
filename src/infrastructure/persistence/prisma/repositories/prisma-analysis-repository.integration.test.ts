import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  AnalysisOutputId,
  AnalysisRecommendationId,
  AnalysisRunId,
  completeAnalysisRun,
  createAnalysisOutput,
  createAnalysisRecommendation,
  createAnalysisRun,
  startAnalysisRun,
} from "@/domain/analysis";
import { OwnerId, ProjectId, createProject, makeProjectName } from "@/domain/project";
import { ConflictError, OptimisticConcurrencyError } from "@/lib/errors";
import {
  PrismaAnalysisRepository,
  PrismaProjectRepository,
} from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const OWNER = OwnerId.unsafe("usr_00000001");
const PROJECT = ProjectId.unsafe("proj_00000001");
const NOW = new Date("2026-07-23T01:00:00Z");
const unwrap = <T>(result: { ok: true; value: T } | { ok: false; error: unknown }): T => {
  if (!result.ok) throw result.error;
  return result.value;
};
let db: PrismaClient;
let repository: PrismaAnalysisRepository;

beforeAll(() => {
  db = createTestPrisma();
  repository = new PrismaAnalysisRepository(db);
});
afterAll(async () => db.$disconnect());
beforeEach(async () => {
  await resetDatabase(db);
  const name = makeProjectName("Documentary");
  if (!name.ok) throw name.error;
  await new PrismaProjectRepository(db).insert(
    createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: NOW }),
  );
});

function run(version = 1) {
  return unwrap(
    createAnalysisRun({
      id: AnalysisRunId.unsafe(`anrun_0000000${version}`),
      ownerId: OWNER,
      projectId: PROJECT,
      version,
      now: NOW,
    }),
  );
}

describe("PrismaAnalysisRepository", () => {
  it("persists versioned runs and rejects duplicate project versions", async () => {
    await repository.insertRun(run());
    await expect(
      repository.insertRun({ ...run(), id: AnalysisRunId.unsafe("anrun_00000009") }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(await repository.listRunsByProject(PROJECT)).toEqual([run()]);
  });

  it("atomically completes a run with outputs and recommendations", async () => {
    const pending = run();
    await repository.insertRun(pending);
    const running = unwrap(startAnalysisRun(pending, NOW));
    await repository.updateRun(running, "PENDING");
    const completed = unwrap(completeAnalysisRun(running, NOW));
    const output = unwrap(
      createAnalysisOutput({
        id: AnalysisOutputId.unsafe("anout_00000001"),
        analysisRunId: pending.id,
        kind: "NARRATIVE",
        content: "A story of repair",
        confidence: 0.8,
        now: NOW,
      }),
    );
    const recommendation = unwrap(
      createAnalysisRecommendation({
        id: AnalysisRecommendationId.unsafe("anrec_00000001"),
        analysisRunId: pending.id,
        title: "Hold the reveal",
        rationale: "It strengthens the turn",
        confidence: 0.9,
        now: NOW,
      }),
    );
    await repository.saveResult(completed, [output], [recommendation]);
    expect((await repository.findRunById(pending.id))?.status).toBe("COMPLETED");
    expect(await repository.listOutputsByRun(pending.id)).toEqual([output]);
    expect(await repository.listRecommendationsByRun(pending.id)).toEqual([recommendation]);
    await expect(repository.saveResult(completed, [], [])).rejects.toBeInstanceOf(
      OptimisticConcurrencyError,
    );
  });

  it("rolls back lifecycle and result rows when a result write fails", async () => {
    const pending = run();
    await repository.insertRun(pending);
    const running = unwrap(startAnalysisRun(pending, NOW));
    await repository.updateRun(running, "PENDING");
    const completed = unwrap(completeAnalysisRun(running, NOW));
    const output = unwrap(
      createAnalysisOutput({
        id: AnalysisOutputId.unsafe("anout_00000001"),
        analysisRunId: AnalysisRunId.unsafe("anrun_99999999"),
        kind: "THEME",
        content: "Repair",
        now: NOW,
      }),
    );
    await expect(repository.saveResult(completed, [output], [])).rejects.toBeTruthy();
    expect((await repository.findRunById(pending.id))?.status).toBe("RUNNING");
    expect(await repository.listOutputsByRun(pending.id)).toEqual([]);
  });
});
