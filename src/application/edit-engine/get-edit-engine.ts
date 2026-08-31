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

interface InterpretedItem extends GroundedItem {
  readonly counterEvidencePrompt: string;
}

function significantTerms(value: string): ReadonlySet<string> {
  return new Set(
    value
      .toLowerCase()
      .match(/[a-z0-9']+/g)
      ?.filter((term) => term.length >= 5) ?? [],
  );
}

function extendsSuppliedIntent(item: GroundedItem, intent: ReadonlySet<string>): boolean {
  const terms = [...significantTerms(item.content)];
  if (terms.length < 2) return false;
  const newTerms = terms.filter((term) => !intent.has(term));
  return newTerms.length >= 2 && newTerms.length / terms.length >= 0.5;
}

function counterEvidencePrompt(kind: AnalysisOutputKind): string {
  switch (kind) {
    case "NARRATIVE":
      return "Check whether omitted or later material changes this proposed progression.";
    case "THEME":
      return "Check whether this pattern holds across the full material, not only the cited moments.";
    case "INFERENCE":
      return "Look for source material that directly contradicts this inference.";
    default:
      return "Review neighboring and contradictory source material before accepting this interpretation.";
  }
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
  readonly evidenceBridge: {
    readonly intended: {
      readonly goal: string;
      readonly audience: string;
      readonly success: string;
    };
    readonly captured: readonly GroundedItem[];
    readonly supportedStory: readonly InterpretedItem[];
    readonly potentialBeyondBrief: readonly GroundedItem[];
    readonly missing: readonly GroundedItem[];
    readonly nextAction: AdvisoryItem | null;
  };
}

export function composeEditEngine(
  creative: AnalysisView,
  grounded: {
    readonly run: { readonly version: number };
    readonly outputs: readonly GroundedItem[];
    readonly recommendations: readonly AdvisoryItem[];
  },
): EditEngineView {
  const captured = grounded.outputs
    .filter((output) => output.kind === "OBSERVATION")
    .sort((left, right) => (right.confidence ?? 0) - (left.confidence ?? 0));
  const interpretations = grounded.outputs
    .filter(
      (output) =>
        output.kind !== "OBSERVATION" &&
        output.kind !== "EDIT_RECOMMENDATION" &&
        output.kind !== "PROMPT",
    )
    .sort((left, right) => (right.confidence ?? 0) - (left.confidence ?? 0))
    .map((output) => ({ ...output, counterEvidencePrompt: counterEvidencePrompt(output.kind) }));
  const missing = grounded.outputs.filter((output) => output.kind === "PROMPT");
  const intentTerms = significantTerms(
    [
      creative.brief.creativeGoal,
      creative.brief.targetAudience,
      creative.brief.successCriteria,
      creative.brief.context,
    ].join(" "),
  );
  return {
    analysisVersion: grounded.run.version,
    story: {
      summary: creative.blueprint.projectSummary,
      objective: creative.blueprint.storyObjective,
      structure: creative.blueprint.recommendedStructure,
      emotionalArc: creative.blueprint.emotionalArc,
    },
    strongestObservations: captured.slice(0, 5),
    recommendations: grounded.recommendations,
    alternatives: creative.blueprint.hookConcepts,
    evidenceBridge: {
      intended: {
        goal: creative.brief.creativeGoal,
        audience: creative.brief.targetAudience,
        success: creative.brief.successCriteria,
      },
      captured: captured.slice(0, 5),
      supportedStory: interpretations.slice(0, 2),
      potentialBeyondBrief: captured
        .filter((item) => extendsSuppliedIntent(item, intentTerms))
        .slice(0, 2),
      missing,
      nextAction: grounded.recommendations[0] ?? null,
    },
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
