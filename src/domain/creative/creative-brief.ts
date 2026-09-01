import { ok, type Result } from "@/lib/result";
import type { ProjectId } from "../project";
import {
  type Brand,
  defineId,
  type DomainError,
  InvalidValueError,
  validateBoundedText,
} from "../shared";
import type { Blueprint } from "./blueprint";
import { emptyCreativePlanningContext, type CreativePlanningContext } from "./visual-planning";

/** Identity of a Creative Brief — the structured context Stroman OS analyzes. */
export type CreativeBriefId = Brand<string, "CreativeBriefId">;
export const CreativeBriefId = defineId<"CreativeBriefId">("CreativeBriefId", "brief");

/**
 * The creator-supplied context for a project, captured before editing begins. It
 * is the raw material the reasoning layer turns into a Creative Blueprint.
 */
export interface CreativeBriefFields {
  readonly title: string;
  readonly client: string;
  readonly projectType: string;
  readonly creativeGoal: string;
  readonly targetAudience: string;
  readonly desiredEmotion: string;
  readonly context: string;
  readonly runtimeTarget: string;
  readonly deliveryPlatform: string;
  readonly references: string;
  readonly restrictions: string;
  readonly clientRequirements: string;
  readonly nonNegotiables: string;
  readonly successCriteria: string;
}

type StructuredIntentKey =
  | "runtimeTarget"
  | "deliveryPlatform"
  | "references"
  | "restrictions"
  | "clientRequirements"
  | "nonNegotiables"
  | "successCriteria";

/** Backward-compatible input: legacy clients may omit newly structured intent. */
export type CreativeBriefInputFields = Omit<CreativeBriefFields, StructuredIntentKey> &
  Partial<Pick<CreativeBriefFields, StructuredIntentKey>>;

export interface CreativeBrief extends CreativeBriefFields {
  readonly id: CreativeBriefId;
  readonly projectId: ProjectId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Optimistic-concurrency token, managed by the persistence layer. */
  readonly lockVersion: number;
  /** The exact quality-gated result shown to the filmmaker. */
  readonly blueprint?: Blueprint | null;
  /** Server-side adapter id for auditability; never exposes credentials. */
  readonly reasoningProvider?: string | null;
  /** Durable lifecycle for the potentially long hosted development pass. */
  readonly developmentStatus: CreativeDevelopmentStatus;
  /** Stable, non-sensitive failure code; never raw provider output. */
  readonly developmentError?: string | null;
  readonly developmentStartedAt?: Date | null;
  /** Filmmaker-owned stage, production, scout, and spatial-correction state. */
  readonly planningContext: CreativePlanningContext;
}

export type CreativeDevelopmentStatus = "DRAFT" | "PROCESSING" | "READY" | "FAILED";

/** Immutable snapshot of filmmaker-supplied intent, recorded on every save. */
export interface CreativeBriefRevision {
  readonly creativeBriefId: CreativeBriefId;
  readonly projectId: ProjectId;
  readonly version: number;
  readonly fields: CreativeBriefFields;
  readonly createdAt: Date;
}

export function creativeBriefFields(brief: CreativeBrief): CreativeBriefFields {
  const fields: Record<string, string> = {};
  for (const [key] of FIELD_SPECS) fields[key] = brief[key];
  return fields as unknown as CreativeBriefFields;
}

export function snapshotCreativeBrief(
  brief: CreativeBrief,
  version = brief.lockVersion,
): CreativeBriefRevision {
  return {
    creativeBriefId: brief.id,
    projectId: brief.projectId,
    version,
    fields: creativeBriefFields(brief),
    createdAt: brief.updatedAt,
  };
}

const FIELD_SPECS: ReadonlyArray<
  readonly [keyof CreativeBriefFields, string, number, "REQUIRED" | "OPTIONAL"]
> = [
  ["title", "Project title", 200, "REQUIRED"],
  ["client", "Client", 200, "OPTIONAL"],
  ["projectType", "Project type", 120, "OPTIONAL"],
  ["creativeGoal", "Creative goal", 2000, "OPTIONAL"],
  ["targetAudience", "Target audience", 2000, "OPTIONAL"],
  ["desiredEmotion", "Desired emotion", 200, "OPTIONAL"],
  ["context", "Context", 20000, "OPTIONAL"],
  ["runtimeTarget", "Runtime", 200, "OPTIONAL"],
  ["deliveryPlatform", "Delivery platform", 300, "OPTIONAL"],
  ["references", "References", 5000, "OPTIONAL"],
  ["restrictions", "Restrictions", 5000, "OPTIONAL"],
  ["clientRequirements", "Client requirements", 5000, "OPTIONAL"],
  ["nonNegotiables", "Non-negotiables", 5000, "OPTIONAL"],
  ["successCriteria", "Success criteria", 5000, "OPTIONAL"],
];

function validateFields(input: CreativeBriefInputFields): Result<CreativeBriefFields, DomainError> {
  const out: Record<string, string> = {};
  for (const [key, label, max, requirement] of FIELD_SPECS) {
    const result = validateBoundedText(input[key] ?? "", {
      label,
      min: requirement === "REQUIRED" ? 1 : 0,
      max,
    });
    if (!result.ok) return result;
    out[key] = result.value;
  }
  return ok(out as unknown as CreativeBriefFields);
}

export function parseCreativeBriefFields(value: unknown): Result<CreativeBriefFields, DomainError> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {
      ok: false,
      error: new InvalidValueError("Creative brief revision snapshot is invalid."),
    };
  }
  const candidate = value as Record<string, unknown>;
  for (const [key] of FIELD_SPECS) {
    if (typeof candidate[key] !== "string") {
      return {
        ok: false,
        error: new InvalidValueError("Creative brief revision snapshot is invalid."),
      };
    }
  }
  return validateFields(candidate as unknown as CreativeBriefFields);
}

export interface CreateCreativeBriefInput extends CreativeBriefInputFields {
  readonly id: CreativeBriefId;
  readonly projectId: ProjectId;
  readonly now: Date;
}

export function createCreativeBrief(
  input: CreateCreativeBriefInput,
): Result<CreativeBrief, DomainError> {
  const fields = validateFields(input);
  if (!fields.ok) return fields;
  return ok({
    ...fields.value,
    id: input.id,
    projectId: input.projectId,
    createdAt: input.now,
    updatedAt: input.now,
    lockVersion: 1,
    blueprint: null,
    reasoningProvider: null,
    developmentStatus: "DRAFT",
    developmentError: null,
    developmentStartedAt: null,
    planningContext: emptyCreativePlanningContext(),
  });
}

export function attachCreativePlanningContext(
  brief: CreativeBrief,
  planningContext: CreativePlanningContext,
  blueprint: Blueprint,
): CreativeBrief {
  return { ...brief, planningContext, blueprint };
}

/** Replace the brief's context (a re-analysis). The persistence layer bumps lockVersion. */
export function reviseCreativeBrief(
  brief: CreativeBrief,
  fields: CreativeBriefInputFields,
  now: Date,
): Result<CreativeBrief, DomainError> {
  const validated = validateFields(fields);
  if (!validated.ok) return validated;
  return ok({
    ...brief,
    ...validated.value,
    updatedAt: now,
    blueprint: null,
    reasoningProvider: null,
    developmentStatus: "DRAFT",
    developmentError: null,
    developmentStartedAt: null,
  });
}

export function markCreativeDevelopmentProcessing(brief: CreativeBrief, now: Date): CreativeBrief {
  return {
    ...brief,
    blueprint: null,
    reasoningProvider: null,
    developmentStatus: "PROCESSING",
    developmentError: null,
    developmentStartedAt: now,
  };
}

export function markCreativeDevelopmentFailed(
  brief: CreativeBrief,
  errorCode: string,
): CreativeBrief {
  return {
    ...brief,
    blueprint: null,
    reasoningProvider: null,
    developmentStatus: "FAILED",
    developmentError: errorCode,
  };
}

export function attachCreativeBlueprint(
  brief: CreativeBrief,
  blueprint: Blueprint,
  reasoningProvider: string,
): CreativeBrief {
  return {
    ...brief,
    blueprint,
    reasoningProvider,
    developmentStatus: "READY",
    developmentError: null,
  };
}
