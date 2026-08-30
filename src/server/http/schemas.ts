import { z } from "zod";

/**
 * HTTP request schemas — intent-shaped, independent of domain constructors and
 * Prisma models. `.strict()` rejects unknown fields. Actor/owner identity is never
 * accepted from a body; it comes from the actor context. Lock versions come from
 * `If-Match`, never a body. Bounds keep payloads reasonable; the domain re-validates.
 */

export const CreateProjectRequest = z.object({ name: z.string().min(1).max(200) }).strict();
export type CreateProjectRequest = z.infer<typeof CreateProjectRequest>;

export const RenameProjectRequest = z.object({ name: z.string().min(1).max(200) }).strict();
export type RenameProjectRequest = z.infer<typeof RenameProjectRequest>;

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
    client: z.string().max(200).default(""),
    projectType: z.string().max(120).default(""),
    creativeGoal: z.string().max(2000).default(""),
    targetAudience: z.string().max(2000).default(""),
    desiredEmotion: z.string().max(200).default(""),
    context: z.string().max(5000).default(""),
    runtimeTarget: z.string().max(200).default(""),
    deliveryPlatform: z.string().max(300).default(""),
    references: z.string().max(5000).default(""),
    restrictions: z.string().max(5000).default(""),
    clientRequirements: z.string().max(5000).default(""),
    nonNegotiables: z.string().max(5000).default(""),
    successCriteria: z.string().max(5000).default(""),
  })
  .strict();
export type AnalyzeProjectRequest = z.infer<typeof AnalyzeProjectRequest>;

const ProductionRealityRequest = z
  .object({
    crew: z.string().max(300).optional(),
    cameraBody: z.string().max(300).optional(),
    lenses: z.string().max(500).optional(),
    support: z.string().max(500).optional(),
    lighting: z.string().max(500).optional(),
    sound: z.string().max(500).optional(),
    shootTime: z.string().max(300).optional(),
    access: z.string().max(500).optional(),
    talent: z.string().max(500).optional(),
    budget: z.string().max(300).optional(),
    timeOfDay: z.string().max(300).optional(),
  })
  .strict();

const SpatialPointRequest = z
  .object({
    x: z.number().finite().min(-100).max(100),
    y: z.number().finite().min(-20).max(50),
    z: z.number().finite().min(-100).max(100),
  })
  .strict();
const SpatialShotRequest = z
  .object({
    id: z.string().min(1).max(100),
    version: z.number().int().positive().max(10000),
    title: z.string().min(1).max(200),
    camera: z
      .object({
        position: SpatialPointRequest,
        target: SpatialPointRequest,
        focalLengthMm: z.number().finite().min(12).max(200),
        aspectRatio: z.enum(["16:9", "9:16"]),
        support: z.enum(["LOCKED", "HANDHELD", "GIMBAL", "DOLLY"]),
      })
      .strict(),
    subject: z
      .object({
        id: z.string().min(1).max(100),
        label: z.string().min(1).max(100),
        position: SpatialPointRequest,
        facingDegrees: z.number().finite().min(-360).max(360),
        pose: z.enum(["SEATED", "STANDING"]),
        endPosition: SpatialPointRequest,
      })
      .strict(),
    movement: z
      .object({
        kind: z.enum(["LOCKED", "PUSH", "PULL", "TRACK", "ARC", "HANDHELD"]),
        start: SpatialPointRequest,
        end: SpatialPointRequest,
      })
      .strict(),
    setPieces: z
      .array(
        z
          .object({
            id: z.string().min(1).max(100),
            label: z.string().min(1).max(160),
            kind: z.enum(["DESK", "TABLE", "COUNTER", "DOOR", "WINDOW", "OBJECT", "PRACTICAL"]),
            position: SpatialPointRequest,
            width: z.number().finite().positive().max(20),
            height: z.number().finite().positive().max(20),
            depth: z.number().finite().positive().max(20),
            color: z.string().regex(/^#[0-9a-f]{6}$/i),
          })
          .strict(),
      )
      .max(40),
    action: z.string().max(2000),
    blocking: z.string().max(2000),
    lightColor: z.string().regex(/^#[0-9a-f]{6}$/i),
    light: z.string().max(2000),
    sound: z.string().max(2000),
    rationale: z.string().max(2000),
    geometryConfidence: z.enum(["OBSERVED", "ESTIMATED", "FILMMAKER_CONFIRMED"]),
  })
  .strict();
const ShotPlanningRequest = z
  .object({
    version: z.literal(1),
    activeShot: SpatialShotRequest,
    savedShots: z.array(SpatialShotRequest).max(100),
  })
  .strict();

export const UpdateCreativePlanningRequest = z
  .object({
    stage: z.enum(["IDEA", "SCOUTING", "PRE_PRODUCTION", "SHOOTING", "POST"]).optional(),
    production: ProductionRealityRequest.optional(),
    correction: z
      .object({
        statement: z.string().min(1).max(1000),
        replacesClaimId: z.string().min(1).max(200).nullish(),
      })
      .strict()
      .optional(),
    shotPlanning: ShotPlanningRequest.optional(),
  })
  .strict()
  .refine(
    (value) => Boolean(value.stage || value.production || value.correction || value.shotPlanning),
    {
      message: "At least one planning change is required.",
    },
  );
export type UpdateCreativePlanningRequest = z.infer<typeof UpdateCreativePlanningRequest>;

// ── Knowledge Acquisition request schemas ──────────────────────────────────
export const CreateKnowledgeSourceRequest = z
  .object({
    name: z.string().min(1).max(200),
    sourceType: z.enum(["UPLOAD", "WEB_PAGE", "MANUAL"]),
    origin: z.string().max(2000).nullish(),
    sourceReliability: z.enum(["VERIFIED", "HIGH", "MEDIUM", "LOW", "UNKNOWN"]),
  })
  .strict();
export type CreateKnowledgeSourceRequest = z.infer<typeof CreateKnowledgeSourceRequest>;

export const AddSourceDocumentRequest = z
  .object({
    documentType: z.enum([
      "TRANSCRIPT",
      "ARTICLE",
      "WEB_PAGE",
      "SOCIAL_POST",
      "PDF",
      "VIDEO",
      "NOTE",
    ]),
    contentHash: z.string().min(1).max(512),
    title: z.string().min(1).max(300),
    mediaType: z.string().max(255).nullish(),
    byteSize: z.number().int().nonnegative().nullish(),
  })
  .strict();
export type AddSourceDocumentRequest = z.infer<typeof AddSourceDocumentRequest>;

export const CreateAcquisitionRunRequest = z
  .object({
    extractor: z.string().min(1).max(120),
    extractorVersion: z.string().min(1).max(60),
  })
  .strict();
export type CreateAcquisitionRunRequest = z.infer<typeof CreateAcquisitionRunRequest>;

const RunSummarySchema = z
  .object({
    documentsProcessed: z.number().int().nonnegative(),
    observationsCreated: z.number().int().nonnegative(),
    failureCount: z.number().int().nonnegative(),
  })
  .strict();

export const CompleteAcquisitionRunRequest = z
  .object({
    status: z.enum(["SUCCEEDED", "PARTIALLY_SUCCEEDED", "FAILED"]),
    summary: RunSummarySchema,
  })
  .strict();
export type CompleteAcquisitionRunRequest = z.infer<typeof CompleteAcquisitionRunRequest>;

export const ObservationPayloadSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("ENTITY"),
      name: z.string().min(1).max(200),
      entityKind: z.string().min(1).max(60),
    })
    .strict(),
  z.object({ kind: z.literal("MEMORY"), content: z.string().min(1).max(5000) }).strict(),
  z.object({ kind: z.literal("INSIGHT"), statement: z.string().min(1).max(2000) }).strict(),
  z
    .object({
      kind: z.literal("RELATIONSHIP"),
      relationType: z.string().min(1).max(60),
      fromLabel: z.string().min(1).max(200),
      toLabel: z.string().min(1).max(200),
    })
    .strict(),
]);

export const ExtractionLocationSchema = z
  .object({
    textSpan: z.string().max(5000).nullish(),
    charStart: z.number().int().nonnegative().nullish(),
    charEnd: z.number().int().nonnegative().nullish(),
    timeStartMs: z.number().int().nonnegative().nullish(),
    timeEndMs: z.number().int().nonnegative().nullish(),
    pageNumber: z.number().int().positive().nullish(),
  })
  .strict();

export const CreateKnowledgeObservationRequest = z
  .object({
    knowledgeSourceId: z.string().min(1).max(200),
    sourceDocumentId: z.string().min(1).max(200),
    acquisitionRunId: z.string().min(1).max(200).nullish(),
    location: ExtractionLocationSchema.nullish(),
    payload: ObservationPayloadSchema,
    createdBy: z.enum(["AI", "HUMAN", "IMPORT"]),
    confidence: z.number().finite().min(0).max(1).nullish(),
  })
  .strict();
export type CreateKnowledgeObservationRequest = z.infer<typeof CreateKnowledgeObservationRequest>;

export const ReviewObservationRequest = z
  .object({
    outcome: z.enum(["ACCEPT", "EDIT_AND_ACCEPT", "REJECT"]),
    note: z.string().max(2000).nullish(),
    editedPayload: ObservationPayloadSchema.nullish(),
  })
  .strict();
export type ReviewObservationRequest = z.infer<typeof ReviewObservationRequest>;

const MaterializationResolutionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("ENTITY") }).strict(),
  z
    .object({
      kind: z.literal("MEMORY"),
      entityId: z.string().min(1).max(200),
      sourceId: z.string().min(1).max(200).nullish(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("INSIGHT"),
      memoryIds: z.array(z.string().min(1).max(200)).min(1).max(100),
      confidence: z.number().finite().min(0).max(1).nullish(),
      evidence: z.string().max(5000).nullish(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("RELATIONSHIP"),
      fromEntityId: z.string().min(1).max(200),
      toEntityId: z.string().min(1).max(200),
    })
    .strict(),
]);

export const MaterializeObservationRequest = z
  .object({ resolution: MaterializationResolutionSchema })
  .strict();
export type MaterializeObservationRequest = z.infer<typeof MaterializeObservationRequest>;
