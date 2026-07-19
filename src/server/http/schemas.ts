import { z } from "zod";

/**
 * HTTP request schemas — intent-shaped, independent of domain constructors and
 * Prisma models. `.strict()` rejects unknown fields. Actor/owner identity is never
 * accepted from a body; it comes from the actor context. Lock versions come from
 * `If-Match`, never a body. Bounds keep payloads reasonable; the domain re-validates.
 */

export const CreateProjectRequest = z.object({ name: z.string().min(1).max(200) }).strict();
export type CreateProjectRequest = z.infer<typeof CreateProjectRequest>;

export const CreateContentRequest = z
  .object({
    type: z.string().min(1).max(64),
    slug: z.string().min(1).max(120),
    title: z.string().min(1).max(200),
  })
  .strict();
export type CreateContentRequest = z.infer<typeof CreateContentRequest>;

const CriterionInput = z
  .object({
    name: z.string().min(1).max(120),
    weight: z.number().finite(),
    anchors: z
      .object({
        one: z.string().min(1).max(500),
        five: z.string().min(1).max(500),
        ten: z.string().min(1).max(500),
      })
      .strict(),
  })
  .strict();

export const CreateRubricRequest = z
  .object({
    slug: z.string().min(1).max(120),
    title: z.string().min(1).max(200),
    criteria: z.array(CriterionInput).min(1).max(100),
  })
  .strict();
export type CreateRubricRequest = z.infer<typeof CreateRubricRequest>;

export const RecordEvaluationRequest = z
  .object({
    projectId: z.string().min(1).max(200),
    rubricId: z.string().min(1).max(200),
    reviewerType: z.enum(["HUMAN", "AI"]),
    scores: z
      .array(
        z
          .object({
            criterionId: z.string().min(1).max(200),
            score: z.number().int(),
            justification: z.string().min(1).max(2000),
          })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict();
export type RecordEvaluationRequest = z.infer<typeof RecordEvaluationRequest>;

const AdvisoryInput = z
  .object({
    recommendedOptionId: z.string().min(1).max(200).nullish(),
    rationale: z.string().min(1).max(2000),
    confidence: z.number().finite(),
  })
  .strict();

export const ProposeDecisionRequest = z
  .object({
    projectId: z.string().min(1).max(200),
    question: z.string().min(1).max(500),
    options: z
      .array(
        z
          .object({
            id: z.string().min(1).max(200),
            label: z.string().min(1).max(200),
            rationale: z.string().max(2000).nullish(),
          })
          .strict(),
      )
      .min(2)
      .max(50),
    advisory: AdvisoryInput.optional(),
  })
  .strict();
export type ProposeDecisionRequest = z.infer<typeof ProposeDecisionRequest>;

export const AttachAdvisoryRequest = AdvisoryInput;
export type AttachAdvisoryRequest = z.infer<typeof AttachAdvisoryRequest>;

export const RecordHumanDecisionRequest = z
  .object({
    selectedOptionId: z.string().min(1).max(200),
    rationale: z.string().min(1).max(2000),
  })
  .strict();
export type RecordHumanDecisionRequest = z.infer<typeof RecordHumanDecisionRequest>;
