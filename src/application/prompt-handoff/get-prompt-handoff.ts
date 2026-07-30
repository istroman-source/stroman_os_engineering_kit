import { getEditEngine, type EditEngineView } from "@/application/edit-engine";
import type { AutomaticAnalysisDependencies } from "@/application/automatic-analysis";
import type { GetCreativeBriefDeps } from "@/application/creative";
import type { OwnerId, ProjectId } from "@/domain/project";
import { ok } from "@/lib/result";

export interface PromptHandoffView {
  readonly format: "PLAIN_TEXT";
  readonly analysisVersion: number;
  readonly prompt: string;
  readonly evidenceReferenceIds: readonly string[];
  readonly wideframe: {
    readonly capability: "MANUAL_COPY_ONLY";
    readonly label: "Manual Wideframe handoff";
    readonly instructions: string;
  };
}

export function synthesizePrompt(editEngine: EditEngineView): PromptHandoffView {
  const evidenceReferenceIds = [
    ...new Set([
      ...editEngine.strongestObservations.flatMap((item) => item.evidenceReferenceIds),
      ...editEngine.recommendations.flatMap((item) => item.evidenceReferenceIds),
    ]),
  ];
  const lines = [
    "EDITORIAL INTENT PACKAGE",
    `Analysis version: ${editEngine.analysisVersion}`,
    "",
    "CURRENT STORY",
    editEngine.story.summary,
    editEngine.story.objective,
    "",
    "RECOMMENDED STRUCTURE",
    editEngine.story.structure,
    ...editEngine.story.emotionalArc.map((beat, index) => `${index + 1}. ${beat}`),
    "",
    "GROUNDED OBSERVATIONS",
    ...editEngine.strongestObservations.map(
      (item) => `- ${item.content} [evidence: ${item.evidenceReferenceIds.join(", ")}]`,
    ),
    "",
    "EDIT RECOMMENDATIONS",
    ...editEngine.recommendations.map(
      (item) =>
        `- ${item.title}: ${item.rationale} [evidence: ${item.evidenceReferenceIds.join(", ")}]`,
    ),
    "",
    "CREATIVE ALTERNATIVES",
    ...editEngine.alternatives.map((item) => `- ${item.title}: ${item.description}`),
    "",
    "CONSTRAINTS",
    "- Treat recommendations as advisory; preserve human editorial control.",
    "- Do not invent dialogue, events, shots, or source evidence.",
    "- Keep source media unchanged and make all edit operations non-destructive.",
  ];
  return {
    format: "PLAIN_TEXT",
    analysisVersion: editEngine.analysisVersion,
    prompt: lines.join("\n"),
    evidenceReferenceIds,
    wideframe: {
      capability: "MANUAL_COPY_ONLY",
      label: "Manual Wideframe handoff",
      instructions:
        "Copy or download this prompt, then paste it into Wideframe. No public Wideframe API or automatic transfer is used.",
    },
  };
}

export async function getPromptHandoff(
  deps: AutomaticAnalysisDependencies & GetCreativeBriefDeps,
  input: { actorId: OwnerId; projectId: ProjectId },
) {
  const editEngine = await getEditEngine(deps, input);
  return editEngine.ok ? ok(synthesizePrompt(editEngine.value)) : editEngine;
}
