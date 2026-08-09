import { describe, expect, it } from "vitest";
import { EvidenceReferenceId } from "@/domain/evidence";
import { InsightId, MemoryId } from "@/domain/memory";
import { OwnerId, ProjectId } from "@/domain/project";
import { InvalidValueError } from "@/domain/shared";
import type { Result } from "@/lib/result";
import {
  CreativeApprovalId,
  CreativeDirectionId,
  CreativeQuestionId,
  CreativeReasoningSessionId,
  DirectionCritiqueId,
  HumanContextId,
  PlanSegmentId,
  ProjectPlanId,
  ReasoningRevisionId,
  answerCreativeQuestion,
  approveProjectPlan,
  completeCreativeReasoningSession,
  createCreativeApproval,
  createCreativeDirection,
  createCreativeEvidenceRef,
  createGroundedClaim,
  createCreativeQuestion,
  createCreativeReasoningSession,
  createDirectionCritique,
  createHumanContext,
  createProjectPlan,
  createReasoningRevision,
  dismissCreativeQuestion,
  recommendCreativeDirection,
  type CreativeDirection,
  type CreativeEvidenceRef,
  type CreativeEvidenceRefInput,
  type GroundedClaim,
  type PlanSegment,
} from ".";

const ownerId = OwnerId.unsafe("usr_CREATIVE01");
const otherOwnerId = OwnerId.unsafe("usr_CREATIVE02");
const projectId = ProjectId.unsafe("proj_CREATIVE01");
const otherProjectId = ProjectId.unsafe("proj_CREATIVE02");
const sessionId = CreativeReasoningSessionId.unsafe("crses_CREATIVE01");
const now = new Date("2026-08-07T12:00:00.000Z");

function value<T, E>(result: Result<T, E>): T {
  if (!result.ok) throw result.error;
  return result.value;
}

const sourceRef = value(
  createCreativeEvidenceRef({
    kind: "SOURCE_EVIDENCE",
    evidenceReferenceId: EvidenceReferenceId.unsafe("evref_CREATIVE01"),
  }),
);
const memoryRef = value(
  createCreativeEvidenceRef({
    kind: "MEMORY_CONTEXT",
    memoryId: MemoryId.unsafe("mem_CREATIVE01"),
  }),
);
const insightRef = value(
  createCreativeEvidenceRef({
    kind: "INSIGHT_CONTEXT",
    insightId: InsightId.unsafe("ins_CREATIVE01"),
  }),
);
const grounded = (ref: CreativeEvidenceRef, note = "Exact grounding"): GroundedClaim => ({
  ref,
  stance: "SUPPORTING",
  note,
});
function direction(
  id: string,
  overrides: Partial<
    Pick<
      CreativeDirection,
      | "ownerId"
      | "projectId"
      | "sessionId"
      | "summary"
      | "intent"
      | "form"
      | "formTags"
      | "origin"
      | "grounding"
    >
  > = {},
) {
  return createCreativeDirection({
    id: CreativeDirectionId.unsafe(id),
    ownerId,
    projectId,
    sessionId,
    summary: "A distinct creative direction",
    intent: "Create a precise audience experience",
    form: "Open form",
    formTags: [],
    origin: "AI",
    grounding: [grounded(sourceRef)],
    createdAt: now,
    ...overrides,
  });
}
function segment(id: string, sequence: number, intent: string): PlanSegment {
  return { id: PlanSegmentId.unsafe(id), sequence, intent, grounding: [] };
}

describe("general creative reasoning", () => {
  it("keeps the filmmaker goal authoritative and the proposed approach separately challengeable", () => {
    const session = value(
      createCreativeReasoningSession({
        id: sessionId,
        ownerId,
        projectId,
        objective: {
          goal: "Make the audience trust the craft",
          proposedApproach: "Use interviews",
        },
        constraints: ["Two-minute runtime"],
        now,
      }),
    );
    const alternative = value(direction("crdir_ALTERNATE1", { form: "Visual demonstration" }));
    const recommended = value(recommendCreativeDirection(session, alternative));
    expect(recommended.objective).toEqual(session.objective);
    expect(recommended.recommendedDirectionId).toBe(alternative.id);
    expect(value(completeCreativeReasoningSession(recommended)).status).toBe("COMPLETED");
  });

  it("rejects a missing objective and empty direction fields", () => {
    expect(
      createCreativeReasoningSession({
        id: sessionId,
        ownerId,
        projectId,
        objective: { goal: " ", proposedApproach: null },
        now,
      }).ok,
    ).toBe(false);
    expect(direction("crdir_EMPTY0001", { summary: "" }).ok).toBe(false);
    expect(direction("crdir_EMPTY0002", { intent: "" }).ok).toBe(false);
    expect(direction("crdir_EMPTY0003", { form: "" }).ok).toBe(false);
  });

  it("rejects an invalid direction origin", () => {
    const result = direction("crdir_ORIGIN001", {
      origin: "AUTOMATION" as unknown as CreativeDirection["origin"],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidValueError);
  });

  it("retains strict source, memory, and insight distinctions at runtime", () => {
    expect(sourceRef).toEqual({
      kind: "SOURCE_EVIDENCE",
      evidenceReferenceId: "evref_CREATIVE01",
    });
    expect(memoryRef).toEqual({ kind: "MEMORY_CONTEXT", memoryId: "mem_CREATIVE01" });
    expect(insightRef).toEqual({ kind: "INSIGHT_CONTEXT", insightId: "ins_CREATIVE01" });
    const invalid: CreativeEvidenceRefInput = {
      kind: "SOURCE_EVIDENCE",
      memoryId: MemoryId.unsafe("mem_CREATIVE02"),
    };
    expect(createCreativeEvidenceRef(invalid).ok).toBe(false);
    expect(
      createCreativeEvidenceRef({
        kind: "MEMORY_CONTEXT",
        memoryId: MemoryId.unsafe("mem_CREATIVE02"),
        insightId: InsightId.unsafe("ins_CREATIVE02"),
      }).ok,
    ).toBe(false);
  });

  it("enforces form-neutral critique authority without narrative dimensions", () => {
    const base = {
      id: DirectionCritiqueId.unsafe("critiq_CREATIVE01"),
      ownerId,
      projectId,
      directionId: CreativeDirectionId.unsafe("crdir_CREATIVE01"),
      strengths: "Clear sensory premise",
      weaknesses: "Needs a stronger ending",
      confidence: 0.8,
      verdict: "CONDITIONAL" as const,
      recommendation: "REVISE" as const,
      rationale: "The form fits once the ending is resolved",
      grounding: [grounded(memoryRef)],
      createdAt: now,
    };
    expect(createDirectionCritique({ ...base, criticType: "AI", criticId: ownerId }).ok).toBe(
      false,
    );
    expect(
      createDirectionCritique({ ...base, criticType: "HUMAN", criticId: otherOwnerId }).ok,
    ).toBe(false);
    expect(createDirectionCritique({ ...base, criticType: "AI", criticId: null }).ok).toBe(true);

    const invalidCriticType = createDirectionCritique({
      ...base,
      criticType: "SYSTEM" as unknown as "AI",
      criticId: otherOwnerId,
    });
    expect(invalidCriticType.ok).toBe(false);
    if (!invalidCriticType.ok) expect(invalidCriticType.error).toBeInstanceOf(InvalidValueError);

    const invalidVerdict = createDirectionCritique({
      ...base,
      criticType: "AI",
      criticId: null,
      verdict: "UNKNOWN" as unknown as typeof base.verdict,
    });
    expect(invalidVerdict.ok).toBe(false);
    if (!invalidVerdict.ok) expect(invalidVerdict.error).toBeInstanceOf(InvalidValueError);

    const invalidRecommendation = createDirectionCritique({
      ...base,
      criticType: "AI",
      criticId: null,
      recommendation: "IGNORE" as unknown as typeof base.recommendation,
    });
    expect(invalidRecommendation.ok).toBe(false);
    if (!invalidRecommendation.ok)
      expect(invalidRecommendation.error).toBeInstanceOf(InvalidValueError);
  });

  it("rejects an invalid grounding stance", () => {
    const result = createGroundedClaim({
      ref: sourceRef,
      stance: "NEUTRAL" as unknown as GroundedClaim["stance"],
      note: "Invalid stance",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidValueError);
  });

  it("requires decision value and enforces question lifecycle", () => {
    const base = {
      id: CreativeQuestionId.unsafe("crqst_CREATIVE01"),
      ownerId,
      projectId,
      target: { kind: "SESSION" as const, sessionId },
      prompt: "Should the product be seen before it is named?",
      decisionImpact: "Changes the reveal order",
      origin: "AI" as const,
      createdAt: now,
    };
    expect(createCreativeQuestion({ ...base, decisionImpact: "" }).ok).toBe(false);
    const question = value(createCreativeQuestion(base));
    const context = value(
      createHumanContext({
        id: HumanContextId.unsafe("hctx_CREATIVE01"),
        ownerId,
        projectId,
        providedBy: ownerId,
        content: "The client requires an immediate product reveal",
        answersQuestionId: question.id,
        createdAt: now,
      }),
    );
    const answered = value(answerCreativeQuestion(question, context));
    expect(answered.answeredByContextId).toBe(context.id);
    expect(dismissCreativeQuestion(answered).ok).toBe(false);
    expect(answerCreativeQuestion(answered, context).ok).toBe(false);
  });

  it("rejects invalid creative question origin and target kind", () => {
    const base = {
      id: CreativeQuestionId.unsafe("crqst_INVALID001"),
      ownerId,
      projectId,
      target: { kind: "SESSION" as const, sessionId },
      prompt: "Should the product be seen before it is named?",
      decisionImpact: "Changes the reveal order",
      origin: "AI" as const,
      createdAt: now,
    };
    const invalidOrigin = createCreativeQuestion({
      ...base,
      origin: "AUTOMATION" as unknown as typeof base.origin,
    });
    expect(invalidOrigin.ok).toBe(false);
    if (!invalidOrigin.ok) expect(invalidOrigin.error).toBeInstanceOf(InvalidValueError);

    const invalidTarget = createCreativeQuestion({
      ...base,
      target: { kind: "PROJECT" } as unknown as typeof base.target,
    });
    expect(invalidTarget.ok).toBe(false);
    if (!invalidTarget.ok) expect(invalidTarget.error).toBeInstanceOf(InvalidValueError);
  });

  it("requires attributable human context", () => {
    expect(
      createHumanContext({
        id: HumanContextId.unsafe("hctx_CREATIVE02"),
        ownerId,
        projectId,
        providedBy: otherOwnerId,
        content: "Unattributed instruction",
        answersQuestionId: null,
        createdAt: now,
      }).ok,
    ).toBe(false);
  });

  it("records immutable revision lineage from human context without overwriting either direction", () => {
    const from = value(direction("crdir_REVISION01", { summary: "Interview-led" }));
    const to = value(direction("crdir_REVISION02", { summary: "Observation-led" }));
    const contextId = HumanContextId.unsafe("hctx_REVISION01");
    const revision = value(
      createReasoningRevision({
        id: ReasoningRevisionId.unsafe("crrev_REVISION01"),
        from,
        to,
        trigger: { kind: "HUMAN_CONTEXT", contextId },
        reason: "The subject will not sit for an interview",
        now,
      }),
    );
    expect(revision).toMatchObject({ fromDirectionId: from.id, toDirectionId: to.id });
    expect(revision.trigger).toEqual({ kind: "HUMAN_CONTEXT", contextId });
    expect(from.summary).toBe("Interview-led");
    expect(to.summary).toBe("Observation-led");
  });

  it("records revision via new evidence and rejects self or cross-project revision", () => {
    const from = value(direction("crdir_EVIDENCE01"));
    const to = value(direction("crdir_EVIDENCE02"));
    expect(
      createReasoningRevision({
        id: ReasoningRevisionId.unsafe("crrev_EVIDENCE01"),
        from,
        to,
        trigger: { kind: "NEW_EVIDENCE", ref: sourceRef },
        reason: "The source contradicts the original premise",
        now,
      }).ok,
    ).toBe(true);
    expect(
      createReasoningRevision({
        id: ReasoningRevisionId.unsafe("crrev_SELF00001"),
        from,
        to: from,
        trigger: { kind: "NEW_EVIDENCE", ref: sourceRef },
        reason: "Invalid",
        now,
      }).ok,
    ).toBe(false);
    const crossProject = value(direction("crdir_CROSS0001", { projectId: otherProjectId }));
    expect(
      createReasoningRevision({
        id: ReasoningRevisionId.unsafe("crrev_CROSS0001"),
        from,
        to: crossProject,
        trigger: { kind: "NEW_EVIDENCE", ref: sourceRef },
        reason: "Invalid",
        now,
      }).ok,
    ).toBe(false);
  });

  it("rejects an invalid revision trigger kind", () => {
    const from = value(direction("crdir_BADTRIGGER1"));
    const to = value(direction("crdir_BADTRIGGER2"));
    const result = createReasoningRevision({
      id: ReasoningRevisionId.unsafe("crrev_BADTRIGGER1"),
      from,
      to,
      trigger: { kind: "SYSTEM_EVENT" } as unknown as Parameters<
        typeof createReasoningRevision
      >[0]["trigger"],
      reason: "Invalid trigger",
      now,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidValueError);
  });

  it("makes approval explicitly human and attributable", () => {
    const proposed = value(direction("crdir_APPROVAL01"));
    expect(
      createCreativeApproval({
        id: CreativeApprovalId.unsafe("crapp_CREATIVE01"),
        direction: proposed,
        approvedBy: otherOwnerId,
        now,
      }).ok,
    ).toBe(false);
    expect(
      value(
        createCreativeApproval({
          id: CreativeApprovalId.unsafe("crapp_CREATIVE01"),
          direction: proposed,
          approvedBy: ownerId,
          now,
        }),
      ).approvedBy,
    ).toBe(ownerId);
  });

  it("rejects empty, duplicate, and non-contiguous project plans", () => {
    const base = {
      id: ProjectPlanId.unsafe("crplan_CREATIVE01"),
      ownerId,
      projectId,
      creativeApprovalId: CreativeApprovalId.unsafe("crapp_CREATIVE01"),
      summary: "A project-specific sequence",
      now,
    };
    expect(createProjectPlan({ ...base, segments: [] }).ok).toBe(false);
    const first = segment("crseg_CREATIVE01", 0, "Begin with tactile detail");
    expect(createProjectPlan({ ...base, segments: [first, { ...first, sequence: 1 }] }).ok).toBe(
      false,
    );
    expect(
      createProjectPlan({
        ...base,
        segments: [first, segment("crseg_CREATIVE02", 2, "Reveal context")],
      }).ok,
    ).toBe(false);
    expect(
      createProjectPlan({
        ...base,
        segments: [first, segment("crseg_CREATIVE02", 0, "Reveal context")],
      }).ok,
    ).toBe(false);
  });

  it("sorts segments deterministically and gates plan approval to the matching project approval", () => {
    const proposed = value(direction("crdir_PLAN00001"));
    const approval = value(
      createCreativeApproval({
        id: CreativeApprovalId.unsafe("crapp_PLAN00001"),
        direction: proposed,
        approvedBy: ownerId,
        now,
      }),
    );
    const plan = value(
      createProjectPlan({
        id: ProjectPlanId.unsafe("crplan_PLAN00001"),
        ownerId,
        projectId,
        creativeApprovalId: approval.id,
        summary: "Ordered by project intent",
        segments: [
          segment("crseg_PLAN00002", 1, "Land the idea"),
          segment("crseg_PLAN00001", 0, "Establish the material"),
        ],
        now,
      }),
    );
    expect(plan.segments.map(({ sequence }) => sequence)).toEqual([0, 1]);
    expect(
      approveProjectPlan(plan, {
        ...approval,
        id: CreativeApprovalId.unsafe("crapp_WRONG00001"),
      }).ok,
    ).toBe(false);
    const wrongApproval = { ...approval, projectId: otherProjectId };
    expect(approveProjectPlan(plan, wrongApproval).ok).toBe(false);
    const approved = value(approveProjectPlan(plan, approval));
    expect(approved).toMatchObject({ status: "APPROVED", approvedBy: ownerId });
    expect(approveProjectPlan(approved, approval).ok).toBe(false);
  });

  it("represents documentary, commercial, and performance work without shared structural devices", () => {
    const cases = [
      {
        id: "crdir_DOCUMENT01",
        form: "Observational documentary with interviews",
        intent: "Let lived detail complicate the stated account",
        segments: ["Observe the morning routine", "Invite reflection after the work"],
      },
      {
        id: "crdir_COMMERCL01",
        form: "Product demonstration commercial",
        intent: "Make the speed benefit physically legible",
        segments: ["Show the slow task", "Demonstrate the faster result", "Name the product"],
      },
      {
        id: "crdir_PERFORM01",
        form: "Rhythm-driven live performance",
        intent: "Build intensity through bodies, light, and tempo",
        segments: ["Hold on breath before sound", "Accelerate cuts with the percussion"],
      },
    ] as const;
    const outputs = cases.map((entry, caseIndex) => {
      const proposed = value(
        direction(entry.id, { form: entry.form, intent: entry.intent, formTags: [] }),
      );
      const approval = value(
        createCreativeApproval({
          id: CreativeApprovalId.unsafe(`crapp_FORM0000${caseIndex}`),
          direction: proposed,
          approvedBy: ownerId,
          now,
        }),
      );
      const plan = value(
        createProjectPlan({
          id: ProjectPlanId.unsafe(`crplan_FORM0000${caseIndex}`),
          ownerId,
          projectId,
          creativeApprovalId: approval.id,
          summary: entry.form,
          segments: entry.segments.map((intent, sequence) =>
            segment(`crseg_FORM${caseIndex}000${sequence}`, sequence, intent),
          ),
          now,
        }),
      );
      return { proposed, plan };
    });
    expect(new Set(outputs.map(({ proposed }) => proposed.form)).size).toBe(3);
    expect(
      new Set(outputs.flatMap(({ plan }) => plan.segments.map(({ intent }) => intent))).size,
    ).toBe(7);
    expect(outputs.map(({ plan }) => plan.segments.length)).toEqual([2, 3, 2]);
  });
});
