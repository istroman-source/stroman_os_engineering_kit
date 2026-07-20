import { z } from "zod";

/**
 * HTTP request schemas — intent-shaped, independent of domain constructors and
 * Prisma models. `.strict()` rejects unknown fields. Actor/owner identity is never
 * accepted from a body; it comes from the actor context. Lock versions come from
 * `If-Match`, never a body. Bounds keep payloads reasonable; the domain re-validates.
 */

export const CreateProjectRequest = z.object({ name: z.string().min(1).max(200) }).strict();
export type CreateProjectRequest = z.infer<typeof CreateProjectRequest>;

// --- Authentication (passwordless email OTP) ---
// The email is validated for shape only; the provider decides deliverability and
// whether an account exists (responses stay neutral to avoid enumeration).
export const StartOtpRequest = z.object({ email: z.string().email().max(320) }).strict();
export type StartOtpRequest = z.infer<typeof StartOtpRequest>;

export const VerifyOtpRequest = z
  .object({ email: z.string().email().max(320), token: z.string().min(4).max(12) })
  .strict();
export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequest>;

// Magic-link callback: the browser extracts the provider session from the URL
// fragment and posts it here. The access token is re-verified server-side before
// any cookie is set — these values are not trusted on their face.
export const CallbackRequest = z
  .object({
    accessToken: z.string().min(1).max(8192),
    refreshToken: z.string().min(1).max(8192),
    expiresInSeconds: z.number().int().positive().max(86_400).optional(),
  })
  .strict();
export type CallbackRequest = z.infer<typeof CallbackRequest>;

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

const AdvisoryEvidenceInput = z
  .object({
    sourceLabel: z.string().min(1).max(200),
    observation: z.string().min(1).max(2000),
    relevance: z.string().min(1).max(2000),
  })
  .strict();

const AdvisoryInput = z
  .object({
    recommendedOptionId: z.string().min(1).max(200).nullish(),
    rationale: z.string().min(1).max(2000),
    confidence: z.number().finite(),
    evidence: z.array(AdvisoryEvidenceInput).max(20).optional(),
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

// ── Memory Engine request schemas ────────────────────────────────────────────
export const CreateEntityRequest = z
  .object({ name: z.string().min(1).max(200), kind: z.string().min(1).max(60) })
  .strict();
export type CreateEntityRequest = z.infer<typeof CreateEntityRequest>;

export const CreateSourceRequest = z
  .object({
    label: z.string().min(1).max(200),
    sourceType: z.string().min(1).max(60),
    url: z.string().max(2000).nullish(),
    detail: z.string().max(5000).nullish(),
  })
  .strict();
export type CreateSourceRequest = z.infer<typeof CreateSourceRequest>;

export const CreateMemoryRequest = z
  .object({
    entityId: z.string().min(1).max(200),
    sourceId: z.string().min(1).max(200).nullish(),
    content: z.string().min(1).max(5000),
  })
  .strict();
export type CreateMemoryRequest = z.infer<typeof CreateMemoryRequest>;

export const CreateRelationshipRequest = z
  .object({
    fromEntityId: z.string().min(1).max(200),
    toEntityId: z.string().min(1).max(200),
    relationType: z.string().min(1).max(60),
  })
  .strict();
export type CreateRelationshipRequest = z.infer<typeof CreateRelationshipRequest>;

export const CreateInsightRequest = z
  .object({
    statement: z.string().min(1).max(2000),
    confidence: z.number().finite(),
    evidence: z.string().max(5000).nullish(),
    memoryIds: z.array(z.string().min(1).max(200)).min(1).max(100),
  })
  .strict();
export type CreateInsightRequest = z.infer<typeof CreateInsightRequest>;

// Analyze Project — the creator's context that Stroman OS turns into a blueprint.
export const AnalyzeProjectRequest = z
  .object({
    title: z.string().min(1).max(200),
    client: z.string().min(1).max(200),
    projectType: z.string().min(1).max(120),
    creativeGoal: z.string().min(1).max(2000),
    targetAudience: z.string().min(1).max(2000),
    desiredEmotion: z.string().min(1).max(200),
    context: z.string().min(1).max(5000),
  })
  .strict();
export type AnalyzeProjectRequest = z.infer<typeof AnalyzeProjectRequest>;
