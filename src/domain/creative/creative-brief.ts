import { ok, type Result } from "@/lib/result";
import type { ProjectId } from "../project";
import { type Brand, defineId, type DomainError, validateBoundedText } from "../shared";
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
}

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
  /** Filmmaker-owned stage, production, scout, and spatial-correction state. */
  readonly planningContext: CreativePlanningContext;
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
  ["context", "Context", 5000, "OPTIONAL"],
];

function validateFields(input: CreativeBriefFields): Result<CreativeBriefFields, DomainError> {
  const out: Record<string, string> = {};
  for (const [key, label, max, requirement] of FIELD_SPECS) {
    const result = validateBoundedText(input[key], {
      label,
      min: requirement === "REQUIRED" ? 1 : 0,
      max,
    });
    if (!result.ok) return result;
    out[key] = result.value;
  }
  return ok(out as unknown as CreativeBriefFields);
}

export interface CreateCreativeBriefInput extends CreativeBriefFields {
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
  fields: CreativeBriefFields,
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
  });
}

export function attachCreativeBlueprint(
  brief: CreativeBrief,
  blueprint: Blueprint,
  reasoningProvider: string,
): CreativeBrief {
  return { ...brief, blueprint, reasoningProvider };
}
