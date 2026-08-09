import { type Brand, defineId } from "@/domain/shared";

export type CreativeReasoningSessionId = Brand<string, "CreativeReasoningSessionId">;
export const CreativeReasoningSessionId = defineId<"CreativeReasoningSessionId">(
  "CreativeReasoningSessionId",
  "crses",
);
export type CreativeDirectionId = Brand<string, "CreativeDirectionId">;
export const CreativeDirectionId = defineId<"CreativeDirectionId">("CreativeDirectionId", "crdir");
export type DirectionCritiqueId = Brand<string, "DirectionCritiqueId">;
export const DirectionCritiqueId = defineId<"DirectionCritiqueId">("DirectionCritiqueId", "critiq");
export type CreativeQuestionId = Brand<string, "CreativeQuestionId">;
export const CreativeQuestionId = defineId<"CreativeQuestionId">("CreativeQuestionId", "crqst");
export type HumanContextId = Brand<string, "HumanContextId">;
export const HumanContextId = defineId<"HumanContextId">("HumanContextId", "hctx");
export type ReasoningRevisionId = Brand<string, "ReasoningRevisionId">;
export const ReasoningRevisionId = defineId<"ReasoningRevisionId">("ReasoningRevisionId", "crrev");
export type CreativeApprovalId = Brand<string, "CreativeApprovalId">;
export const CreativeApprovalId = defineId<"CreativeApprovalId">("CreativeApprovalId", "crapp");
export type ProjectPlanId = Brand<string, "ProjectPlanId">;
export const ProjectPlanId = defineId<"ProjectPlanId">("ProjectPlanId", "crplan");
export type PlanSegmentId = Brand<string, "PlanSegmentId">;
export const PlanSegmentId = defineId<"PlanSegmentId">("PlanSegmentId", "crseg");
