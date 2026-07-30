import type { AnalysisView } from "@/application/creative";
import { getCreativeBrief } from "@/application/creative";
import { getLatestAutomaticAnalysis } from "@/application/automatic-analysis";
import type { AnalysisOutputKind } from "@/domain/analysis";
import type { OwnerId, ProjectId } from "@/domain/project";
import type { AutomaticAnalysisDependencies } from "@/application/automatic-analysis";
import type { GetCreativeBriefDeps } from "@/application/creative";
import { ok } from "@/lib/result";

interface GroundedItem {
  readonly id: string;
  readonly content: string;
  readonly kind: AnalysisOutputKind;
  readonly confidence: number | null;
  readonly evidenceReferenceIds: readonly string[];
}

interface AdvisoryItem {
  readonly id: string;
  readonly title: string;
  readonly rationale: string;
  readonly confidence: number;
  readonly evidenceReferenceIds: readonly string[];
}

export interface EditEngineView {
  readonly analysisVersion: number;
  readonly story: {
    readonly summary: string;
    readonly objective: string;
    readonly structure: string;
    readonly emotionalArc: readonly string[];
  };
  readonly strongestObservations: readonly GroundedItem[];
  readonly recommendations: readonly AdvisoryItem[];
  readonly alternatives: readonly {
    readonly title: string;
    readonly description: string;
  }[];
}

export function composeEditEngine(
  creative: AnalysisView,
  grounded: {
    readonly run: { readonly version: number };
    readonly outputs: readonly GroundedItem[];
    readonly recommendations: readonly AdvisoryItem[];
  },
): EditEngineView {
  return {
    analysisVersion: grounded.run.version,
    story: {
      summary: creative.blueprint.projectSummary,
      objective: creative.blueprint.storyObjective,
      structure: creative.blueprint.recommendedStructure,
      emotionalArc: creative.blueprint.emotionalArc,
    },
    strongestObservations: grounded.outputs
      .filter((output) => output.kind !== "EDIT_RECOMMENDATION" && output.kind !== "PROMPT")
      .sort((left, right) => (right.confidence ?? 0) - (left.confidence ?? 0))
      .slice(0, 5),
    recommendations: grounded.recommendations,
    alternatives: creative.blueprint.hookConcepts,
  };
}

export async function getEditEngine(
  deps: AutomaticAnalysisDependencies & GetCreativeBriefDeps,
  input: { actorId: OwnerId; projectId: ProjectId },
) {
  const creative = await getCreativeBrief(deps, input);
  if (!creative.ok) return creative;
  const grounded = await getLatestAutomaticAnalysis(deps, input);
  if (!grounded.ok) return grounded;
  return ok(composeEditEngine(creative.value, grounded.value));
}
