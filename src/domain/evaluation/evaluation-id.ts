import { type Brand, defineId } from "../shared";

export type EvaluationId = Brand<string, "EvaluationId">;
export const EvaluationId = defineId<"EvaluationId">("EvaluationId", "eval");

export type RubricId = Brand<string, "RubricId">;
export const RubricId = defineId<"RubricId">("RubricId", "rbr");

export type CriterionId = Brand<string, "CriterionId">;
export const CriterionId = defineId<"CriterionId">("CriterionId", "crit");
