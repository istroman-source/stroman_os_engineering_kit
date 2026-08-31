import { err, ok } from "@/lib/result";
import { OptimisticConcurrencyError } from "@/lib/errors";
import type { OwnerId, ProjectId } from "@/domain/project";
import { attempt } from "@/application/shared/attempt";
import {
  getProjectReview,
  type GetProjectReviewDeps,
  type ProjectReviewView,
} from "@/application/project-review";

export type ProjectExportKind =
  | "snapshot-json"
  | "treatment"
  | "shot-plan"
  | "edit-brief"
  | "decision-record"
  | "review-packet"
  | "decisions-csv";

export interface ProjectExportView {
  readonly kind: ProjectExportKind;
  readonly snapshotId: string;
  readonly filename: string;
  readonly contentType: string;
  readonly body: string;
}

function safeStem(value: string): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 80) || "stroman-project"
  );
}

function oneLine(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function csv(value: unknown): string {
  let text = String(value ?? "").replaceAll('"', '""');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text}"`;
}

function decisionLabel(decision: ProjectReviewView["decisions"][number]): string {
  if (!decision.selectedOptionId) return "Open";
  return (
    decision.options.find((option) => option.id === decision.selectedOptionId)?.label ??
    decision.selectedOptionId
  );
}

function reviewMarkdown(review: ProjectReviewView, snapshotId: string): string {
  const lines = [
    `# ${review.project.name} — project review`,
    "",
    `Snapshot: ${snapshotId}`,
    `Readiness: ${review.readiness.replaceAll("_", " ").toLowerCase()}`,
    "",
    "## Current intent",
    "",
    review.intent?.creativeGoal || "Intent has not been developed.",
    review.intent?.currentDirection ? `Current direction: ${review.intent.currentDirection}` : "",
    review.intent?.targetAudience ? `Audience: ${review.intent.targetAudience}` : "",
    review.intent?.desiredEmotion ? `Intended feeling: ${review.intent.desiredEmotion}` : "",
    "",
    "## Source-backed observations",
    "",
    ...review.evidence
      .filter((item) => item.kind === "OBSERVATION")
      .map(
        (item) =>
          `- ${oneLine(item.content)} [${item.sourceKind.toLowerCase()}; evidence: ${item.evidenceReferenceIds.join(", ") || "none"}]`,
      ),
    "",
    "## Editorial interpretations",
    "",
    ...review.evidence
      .filter((item) => item.kind !== "OBSERVATION")
      .map((item) => `- ${oneLine(item.content)} [confidence: ${item.confidence ?? "unscored"}]`),
    "",
    "## Recommendations",
    "",
    ...review.recommendations.map(
      (item) => `- **${oneLine(item.title)}** — ${oneLine(item.rationale)}`,
    ),
    "",
    "## Filmmaker decisions",
    "",
    ...review.decisions.map(
      (decision) =>
        `- **${oneLine(decision.question)}** — ${oneLine(decisionLabel(decision))}${decision.decisionRationale ? `: ${oneLine(decision.decisionRationale)}` : ""}`,
    ),
    "",
    "## Missing coverage and unresolved work",
    "",
    ...review.missingCoverage.map((item) => `- ${oneLine(item)}`),
    ...review.conflicts.map((item) => `- Revisit: ${oneLine(item)}`),
    ...review.unresolvedActions.map((item) => `- ${oneLine(item)}`),
  ];
  return `${lines
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n")
    .trim()}\n`;
}

function treatmentMarkdown(
  review: ProjectReviewView,
  brief: NonNullable<Awaited<ReturnType<GetProjectReviewDeps["creativeBriefs"]["findByProject"]>>>,
  snapshotId: string,
): string {
  const blueprint = brief.blueprint;
  const lines = [
    `# ${brief.title} — treatment`,
    "",
    `Snapshot: ${snapshotId}`,
    "",
    "## Intent",
    "",
    brief.creativeGoal || "Creative goal remains open.",
    brief.targetAudience ? `Audience: ${brief.targetAudience}` : "",
    brief.desiredEmotion ? `Intended feeling: ${brief.desiredEmotion}` : "",
    "",
    "## Creative direction",
    "",
    blueprint?.development.directionDecision.title ?? "No direction has been developed.",
    blueprint?.development.directionDecision.whyThisProject ?? "",
    blueprint ? `Tradeoff: ${blueprint.development.directionDecision.sacrifice}` : "",
    "",
    "## Scene progression",
    "",
    ...(blueprint?.development.sceneHypotheses.map(
      (scene, index) =>
        `${index + 1}. **${oneLine(scene.title)}** — ${oneLine(scene.action)} ${oneLine(scene.turn)}`,
    ) ?? ["No scene progression has been developed."]),
    "",
    "## Approved choices",
    "",
    ...review.decisions
      .filter((decision) => decision.status === "DECIDED")
      .map((decision) => `- ${oneLine(decision.question)} — ${oneLine(decisionLabel(decision))}`),
  ];
  return `${lines
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n")
    .trim()}\n`;
}

function shotPlanMarkdown(
  brief: NonNullable<Awaited<ReturnType<GetProjectReviewDeps["creativeBriefs"]["findByProject"]>>>,
  snapshotId: string,
): string {
  const visualShots = brief.blueprint?.development.visualPlan.shots ?? [];
  const savedShots = brief.planningContext.shotPlanning?.savedShots ?? [];
  const locationShots = brief.planningContext.locationWorkspace?.savedShots ?? [];
  const lines = [
    `# ${brief.title} — shot plan`,
    "",
    `Snapshot: ${snapshotId}`,
    "",
    "## Saved filmmaker shots",
    "",
    ...savedShots.map(
      (shot) =>
        `- **${oneLine(shot.title)} v${shot.version}** — ${shot.camera.aspectRatio}, ${shot.camera.focalLengthMm}mm, ${shot.camera.support.toLowerCase()}. ${oneLine(shot.action)} Blocking: ${oneLine(shot.blocking)} Light: ${oneLine(shot.light)} Sound: ${oneLine(shot.sound)}`,
    ),
    ...locationShots.map(
      (shot) =>
        `- **${oneLine(shot.title)} v${shot.version}** — environment ${oneLine(shot.environmentId)} v${shot.environmentVersion}, ${shot.camera.aspectRatio}, ${shot.camera.focalLengthMm}mm. ${oneLine(shot.shootingInstructions)}`,
    ),
    ...(savedShots.length + locationShots.length === 0 ? ["No filmmaker-saved shots yet."] : []),
    "",
    "## Proposed coverage",
    "",
    ...visualShots.flatMap((shot) => [
      `### ${oneLine(shot.title)} — ${shot.priority.toLowerCase().replaceAll("_", " ")}`,
      oneLine(shot.purpose),
      `- 16:9: ${oneLine(shot.horizontal.shotScale)}, ${oneLine(shot.horizontal.lens)}, ${oneLine(shot.horizontal.cameraHeight)}, ${oneLine(shot.horizontal.movement)}. ${shot.horizontal.executionStrip.join(" → ")}`,
      `- 9:16: ${oneLine(shot.vertical.shotScale)}, ${oneLine(shot.vertical.lens)}, ${oneLine(shot.vertical.cameraHeight)}, ${oneLine(shot.vertical.movement)}. ${shot.vertical.executionStrip.join(" → ")}`,
      "",
    ]),
    ...(visualShots.length === 0 ? ["No proposed coverage has been developed."] : []),
  ];
  return `${lines
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n")
    .trim()}\n`;
}

function editBriefMarkdown(review: ProjectReviewView, snapshotId: string): string {
  return `${[
    `# ${review.project.name} — edit brief`,
    "",
    `Snapshot: ${snapshotId}`,
    "",
    "## Intended outcome",
    "",
    review.intent?.creativeGoal || "Intent remains open.",
    "",
    "## Captured facts",
    "",
    ...review.evidence
      .filter((item) => item.kind === "OBSERVATION")
      .map(
        (item) => `- ${oneLine(item.content)} [evidence: ${item.evidenceReferenceIds.join(", ")}]`,
      ),
    "",
    "## Edit recommendations",
    "",
    ...review.recommendations.map(
      (item) => `- **${oneLine(item.title)}** — ${oneLine(item.rationale)}`,
    ),
    "",
    "## Final edit choices",
    "",
    ...review.decisions
      .filter((decision) => decision.context.originStage === "EDIT")
      .map((decision) => `- ${oneLine(decision.question)} — ${oneLine(decisionLabel(decision))}`),
  ]
    .join("\n")
    .trim()}\n`;
}

function decisionRecordMarkdown(review: ProjectReviewView, snapshotId: string): string {
  const lines = [
    `# ${review.project.name} — decision record`,
    "",
    `Snapshot: ${snapshotId}`,
    "",
    ...review.decisions.flatMap((decision) => [
      `## ${oneLine(decision.question)}`,
      "",
      `Status: ${decision.status.toLowerCase()}`,
      `Selection: ${oneLine(decisionLabel(decision))}`,
      `Stage: ${decision.context.originStage.toLowerCase()}`,
      `Affected artifact: ${decision.context.artifactKind.toLowerCase()} ${decision.context.artifactId ?? "unspecified"}${decision.context.artifactVersion ? ` v${decision.context.artifactVersion}` : ""}`,
      `Rationale: ${decision.decisionRationale ? oneLine(decision.decisionRationale) : "Awaiting filmmaker decision."}`,
      `Owner: ${decision.decidedBy ?? "Awaiting filmmaker"}`,
      `Review state: ${decision.context.needsReview ? oneLine(decision.context.reviewReason ?? "Revisit") : "Current"}`,
      "",
    ]),
    ...(review.decisions.length === 0 ? ["No decisions have been recorded."] : []),
  ];
  return `${lines.join("\n").trim()}\n`;
}

export async function getProjectExport(
  deps: GetProjectReviewDeps,
  input: { actorId: OwnerId; projectId: ProjectId; kind: ProjectExportKind },
) {
  const reviewResult = await getProjectReview(deps, input);
  if (!reviewResult.ok) return reviewResult;
  const briefResult = await attempt("creativeBrief.findByProject", () =>
    deps.creativeBriefs.findByProject(input.projectId),
  );
  if (!briefResult.ok) return briefResult;
  const brief = briefResult.value;
  const decisionVersions = reviewResult.value.decisions
    .map((decision) => ({ id: decision.id as string, version: decision.lockVersion }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const versionKey = [
    `intent-${brief?.lockVersion ?? 0}`,
    ...decisionVersions.map((decision) => `${decision.id}-${decision.version}`),
  ].join("_");
  const snapshotId = `${input.projectId}-${versionKey}`;
  const snapshot = {
    schemaVersion: 1,
    snapshotId,
    versions: { intent: brief?.lockVersion ?? null, decisions: decisionVersions },
    review: reviewResult.value,
    creativeBlueprint: brief?.blueprint ?? null,
    planningContext: brief?.planningContext ?? null,
  };

  const confirmedBrief = await attempt("creativeBrief.findByProject", () =>
    deps.creativeBriefs.findByProject(input.projectId),
  );
  if (!confirmedBrief.ok) return confirmedBrief;
  const confirmedDecisions = await attempt("decision.listByProject", () =>
    deps.decisions.listByProject(input.projectId),
  );
  if (!confirmedDecisions.ok) return confirmedDecisions;
  const confirmedDecisionVersions = confirmedDecisions.value
    .map((decision) => ({ id: decision.id as string, version: decision.lockVersion }))
    .sort((left, right) => left.id.localeCompare(right.id));
  if (
    confirmedBrief.value?.lockVersion !== brief?.lockVersion ||
    JSON.stringify(confirmedDecisionVersions) !== JSON.stringify(decisionVersions)
  ) {
    return err(new OptimisticConcurrencyError("Project changed while the export was being built"));
  }

  const stem = safeStem(reviewResult.value.project.name);
  if (input.kind === "snapshot-json") {
    return ok({
      kind: input.kind,
      snapshotId,
      filename: `${stem}-${safeStem(snapshotId)}.json`,
      contentType: "application/json; charset=utf-8",
      body: `${JSON.stringify(snapshot, null, 2)}\n`,
    });
  }
  if (input.kind === "decisions-csv") {
    const rows = [
      [
        "snapshot_id",
        "decision_id",
        "question",
        "status",
        "selection",
        "rationale",
        "owner",
        "stage",
        "artifact",
        "artifact_version",
        "needs_review",
      ],
      ...reviewResult.value.decisions.map((decision) => [
        snapshotId,
        decision.id,
        decision.question,
        decision.status,
        decisionLabel(decision),
        decision.decisionRationale ?? "",
        decision.decidedBy ?? "",
        decision.context.originStage,
        decision.context.artifactId ?? "",
        decision.context.artifactVersion ?? "",
        decision.context.needsReview,
      ]),
    ];
    return ok({
      kind: input.kind,
      snapshotId,
      filename: `${stem}-decision-record-${safeStem(snapshotId)}.csv`,
      contentType: "text/csv; charset=utf-8",
      body: `${rows.map((row) => row.map(csv).join(",")).join("\n")}\n`,
    });
  }
  const markdown =
    input.kind === "treatment"
      ? brief
        ? treatmentMarkdown(reviewResult.value, brief, snapshotId)
        : reviewMarkdown(reviewResult.value, snapshotId)
      : input.kind === "shot-plan"
        ? brief
          ? shotPlanMarkdown(brief, snapshotId)
          : `# ${reviewResult.value.project.name} — shot plan\n\nNo project intent or shot plan is available.\n`
        : input.kind === "edit-brief"
          ? editBriefMarkdown(reviewResult.value, snapshotId)
          : input.kind === "decision-record"
            ? decisionRecordMarkdown(reviewResult.value, snapshotId)
            : reviewMarkdown(reviewResult.value, snapshotId);
  return ok({
    kind: input.kind,
    snapshotId,
    filename: `${stem}-${input.kind}-${safeStem(snapshotId)}.md`,
    contentType: "text/markdown; charset=utf-8",
    body: markdown,
  });
}
