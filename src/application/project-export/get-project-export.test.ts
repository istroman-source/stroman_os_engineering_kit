import { describe, expect, it, vi } from "vitest";
import { OptimisticConcurrencyError } from "@/lib/errors";
import { OwnerId, ProjectId } from "@/domain/project";
import { getProjectExport } from "./get-project-export";
import type { GetProjectReviewDeps } from "@/application/project-review";

const OWNER = OwnerId.unsafe("usr_EXPORT001");
const OTHER = OwnerId.unsafe("usr_EXPORT002");
const PROJECT = ProjectId.unsafe("proj_EXPORT01");
const now = new Date("2026-08-31T12:00:00.000Z");

function project(name = "Harbor / Light") {
  return {
    id: PROJECT,
    ownerId: OWNER,
    name,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    lockVersion: 1,
  };
}

function deps(input: { name?: string; decisions?: readonly unknown[] } = {}): GetProjectReviewDeps {
  return {
    projects: { findById: vi.fn().mockResolvedValue(project(input.name)) },
    creativeBriefs: { findByProject: vi.fn().mockResolvedValue(null) },
    analyses: {
      listRunsByProject: vi.fn().mockResolvedValue([]),
      listOutputsByRun: vi.fn().mockResolvedValue([]),
      listRecommendationsByRun: vi.fn().mockResolvedValue([]),
    },
    decisions: { listByProject: vi.fn().mockResolvedValue(input.decisions ?? []) },
    sourceImports: { listByProject: vi.fn().mockResolvedValue([]) },
  } as unknown as GetProjectReviewDeps;
}

function decision(question = "Use the silence?") {
  return {
    id: "dec_EXPORT001",
    projectId: PROJECT,
    question,
    options: [
      { id: "keep", label: "Keep", rationale: null },
      { id: "reject", label: "Reject", rationale: null },
    ],
    advisory: null,
    context: {
      originStage: "EDIT",
      artifactKind: "EDIT_RECOMMENDATION",
      artifactId: "rec-1",
      artifactVersion: 2,
      needsReview: false,
      reviewReason: null,
    },
    status: "DECIDED",
    selectedOptionId: "keep",
    decidedBy: OWNER,
    decisionRationale: "The pause carries the turn.",
    createdAt: now,
    decidedAt: now,
    lockVersion: 3,
  };
}

describe("getProjectExport", () => {
  it("builds a filename-safe JSON snapshot tied to exact intent and decision versions", async () => {
    const result = await getProjectExport(deps({ decisions: [decision()] }), {
      actorId: OWNER,
      projectId: PROJECT,
      kind: "snapshot-json",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.filename).toMatch(/^harbor-light-/);
    expect(result.value.filename).not.toMatch(/[\\/]/);
    const body = JSON.parse(result.value.body) as {
      snapshotId: string;
      versions: { intent: null; decisions: Array<{ id: string; version: number }> };
    };
    expect(body.snapshotId).toBe(result.value.snapshotId);
    expect(body.versions).toEqual({
      intent: null,
      decisions: [{ id: "dec_EXPORT001", version: 3 }],
    });
  });

  it("neutralizes spreadsheet formulas in the structured decision export", async () => {
    const result = await getProjectExport(deps({ decisions: [decision("=IMPORTXML(A1)")] }), {
      actorId: OWNER,
      projectId: PROJECT,
      kind: "decisions-csv",
    });
    expect(result.ok && result.value.body).toContain('"\'=IMPORTXML(A1)"');
  });

  it("rejects a torn snapshot when a decision changes during generation", async () => {
    const original = decision();
    const changed = { ...original, lockVersion: 4 };
    const d = deps();
    vi.mocked(d.decisions.listByProject)
      .mockResolvedValueOnce([original] as never)
      .mockResolvedValueOnce([changed] as never);
    const result = await getProjectExport(d, {
      actorId: OWNER,
      projectId: PROJECT,
      kind: "review-packet",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(OptimisticConcurrencyError);
  });

  it("inherits the project ownership boundary", async () => {
    const result = await getProjectExport(deps(), {
      actorId: OTHER,
      projectId: PROJECT,
      kind: "review-packet",
    });
    expect(result.ok).toBe(false);
  });
});
