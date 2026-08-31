import { describe, expect, it, vi } from "vitest";
import { OwnerId, ProjectId } from "@/domain/project";
import { NotAuthorizedError } from "@/application/shared/errors";
import { getProjectReview, type GetProjectReviewDeps } from "./get-project-review";

const OWNER = OwnerId.unsafe("usr_REVIEW001");
const OTHER = OwnerId.unsafe("usr_REVIEW002");
const PROJECT = ProjectId.unsafe("proj_REVIEW01");
const now = new Date("2026-08-31T10:00:00.000Z");

function deps(overrides: Record<string, unknown> = {}): GetProjectReviewDeps {
  return {
    projects: {
      findById: vi.fn().mockResolvedValue({
        id: PROJECT,
        ownerId: OWNER,
        name: "Harbor Light",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
        lockVersion: 1,
      }),
    },
    creativeBriefs: { findByProject: vi.fn().mockResolvedValue(null) },
    analyses: {
      listRunsByProject: vi.fn().mockResolvedValue([]),
      listOutputsByRun: vi.fn().mockResolvedValue([]),
      listRecommendationsByRun: vi.fn().mockResolvedValue([]),
    },
    decisions: { listByProject: vi.fn().mockResolvedValue([]) },
    sourceImports: { listByProject: vi.fn().mockResolvedValue([]) },
    ...overrides,
  } as unknown as GetProjectReviewDeps;
}

describe("getProjectReview", () => {
  it("returns an honest empty review before work begins", async () => {
    const result = await getProjectReview(deps(), { actorId: OWNER, projectId: PROJECT });
    expect(result.ok && result.value.readiness).toBe("EMPTY");
    expect(result.ok && result.value.missingCoverage).toEqual([
      "Project intent has not been developed yet.",
      "No completed footage, transcript, or reference source is available.",
      "No completed source analysis is available.",
    ]);
  });

  it("assembles current intent, canonical evidence, recommendations, and accepted choices", async () => {
    const run = {
      id: "anrun_REVIEW01",
      ownerId: OWNER,
      projectId: PROJECT,
      version: 2,
      sourceKind: "TRANSCRIPT",
      status: "COMPLETED",
      failureReason: null,
      createdAt: now,
      startedAt: now,
      completedAt: now,
    };
    const decision = {
      id: "dec_REVIEW001",
      projectId: PROJECT,
      question: "Use the silence before the reveal?",
      options: [
        { id: "keep", label: "Keep the silence", rationale: null },
        { id: "reject", label: "Reject", rationale: null },
      ],
      advisory: null,
      context: {
        originStage: "EDIT",
        artifactKind: "EDIT_RECOMMENDATION",
        artifactId: "anrec_REVIEW1",
        artifactVersion: 2,
        needsReview: false,
        reviewReason: null,
      },
      status: "DECIDED",
      selectedOptionId: "keep",
      decidedBy: OWNER,
      decisionRationale: "The pause lets the turn land.",
      createdAt: now,
      decidedAt: now,
      lockVersion: 2,
    };
    const result = await getProjectReview(
      deps({
        creativeBriefs: {
          findByProject: vi.fn().mockResolvedValue({
            id: "brief_REVIEW01",
            projectId: PROJECT,
            title: "Harbor Light",
            creativeGoal: "Make the cost of leaving visible.",
            targetAudience: "People deciding whether to return home.",
            desiredEmotion: "Uneasy hope",
            lockVersion: 3,
            updatedAt: now,
            blueprint: { development: { directionDecision: { title: "The tide decides" } } },
          }),
        },
        analyses: {
          listRunsByProject: vi.fn().mockResolvedValue([run]),
          listOutputsByRun: vi.fn().mockResolvedValue([
            {
              id: "anout_REVIEW1",
              kind: "OBSERVATION",
              content: "The subject pauses before answering.",
              confidence: 0.92,
              evidenceReferenceIds: ["evref_REVIEW1"],
            },
          ]),
          listRecommendationsByRun: vi.fn().mockResolvedValue([
            {
              id: "anrec_REVIEW1",
              title: "Hold the unanswered beat",
              rationale: "The pause carries the conflict.",
              confidence: 0.84,
              evidenceReferenceIds: ["evref_REVIEW1"],
              decisionId: null,
            },
          ]),
        },
        decisions: { listByProject: vi.fn().mockResolvedValue([decision]) },
        sourceImports: {
          listByProject: vi
            .fn()
            .mockResolvedValue([{ status: "COMPLETED", sourceKind: "TRANSCRIPT" }]),
        },
      }),
      { actorId: OWNER, projectId: PROJECT },
    );
    expect(result.ok && result.value).toMatchObject({
      readiness: "READY",
      decisionSummary: { accepted: 1, rejected: 0, deferred: 0, unresolved: 0 },
      missingCoverage: [],
      unresolvedActions: [],
    });
    expect(result.ok && result.value.evidence[0]?.evidenceReferenceIds).toEqual(["evref_REVIEW1"]);
    expect(result.ok && result.value.recommendations[0]?.decisionId).toBe("dec_REVIEW001");
  });

  it("surfaces stale choices, missing evidence, and unresolved action without inventing readiness", async () => {
    const result = await getProjectReview(
      deps({
        decisions: {
          listByProject: vi.fn().mockResolvedValue([
            {
              id: "dec_REVIEW002",
              projectId: PROJECT,
              question: "Use this shot?",
              options: [
                { id: "keep", label: "Keep", rationale: null },
                { id: "defer", label: "Defer", rationale: null },
              ],
              advisory: null,
              context: {
                originStage: "BUILD",
                artifactKind: "SHOT_PLAN",
                artifactId: "shot-1",
                artifactVersion: 1,
                needsReview: true,
                reviewReason: "The room plan changed.",
              },
              status: "PROPOSED",
              selectedOptionId: null,
              decidedBy: null,
              decisionRationale: null,
              createdAt: now,
              decidedAt: null,
              lockVersion: 2,
            },
          ]),
        },
      }),
      { actorId: OWNER, projectId: PROJECT },
    );
    expect(result.ok && result.value.readiness).toBe("NEEDS_ATTENTION");
    expect(result.ok && result.value.conflicts[0]).toContain("room plan changed");
    expect(result.ok && result.value.unresolvedActions[0]).toContain("Decide: Use this shot?");
  });

  it("denies review access to a non-owner", async () => {
    const result = await getProjectReview(deps(), { actorId: OTHER, projectId: PROJECT });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });
});
