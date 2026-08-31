"use client";

import { useState } from "react";
import {
  instructionAtDeskShotPlanning,
  type LocationReconstructionView,
  type ProductionReality,
  type ProductionStage,
  type ShotPlanningState,
  type LocationWorkspaceState,
  type SpatialSetPieceState,
  type SpatialShotState,
} from "@/domain/creative";
import { Button } from "@/ui/primitives/button";
import type { Analysis } from "./creative-api";
import { ProductionRealityForm, ScoutPlanningInput, VisualPlanView } from "./visual-plan";
import { ShotPlanningSpace } from "./shot-planning-space";
import { RealLocationWorkspace } from "./real-location-workspace";

type Depth = "SPINE" | "BLUEPRINT" | "DEEP_ROOM";

const stages: ReadonlyArray<readonly [ProductionStage, string]> = [
  ["IDEA", "Idea"],
  ["SCOUTING", "Scouting"],
  ["PRE_PRODUCTION", "Pre-production"],
  ["SHOOTING", "Shooting"],
  ["POST", "Post"],
];

const depths: ReadonlyArray<readonly [Depth, string, string]> = [
  ["SPINE", "Story", "Develop the film"],
  ["BLUEPRINT", "Plan", "Enter and shape the shot"],
  ["DEEP_ROOM", "Edit", "Work with captured material"],
];

function recommendedSpatialShot(analysis: Analysis): ShotPlanningState {
  const calibrationText = [
    analysis.brief.title,
    analysis.brief.context,
    analysis.brief.creativeGoal,
  ].join(" ");
  if (
    /instruction at the desk|intern.*desk|sticky note.*drawer|desk phone.*mug/i.test(
      calibrationText,
    )
  )
    return instructionAtDeskShotPlanning();

  const baseline = instructionAtDeskShotPlanning().activeShot;
  const development = analysis.blueprint.development;
  const plan = development.visualPlan;
  const planned = plan.shots[0];
  const scene = development.sceneHypotheses.find((item) => item.id === planned?.sceneId);
  if (!planned || !scene) return instructionAtDeskShotPlanning();

  const toWorldX = (value: number) => (value - 50) / 10;
  const toWorldZ = (value: number) => (50 - value) / 10;
  const focalLength = Number(
    planned.horizontal.executionStrip.join(" ").match(/≈?\s*(\d{2,3})mm/i)?.[1] ?? 35,
  );
  const blockingSubject = plan.blocking.subjects[0];
  const subjectStart = blockingSubject?.states[0];
  const subjectEnd = blockingSubject?.states.at(-1);
  const cameraMark = plan.blocking.cameras[0];
  const cameraPosition = cameraMark
    ? { x: toWorldX(cameraMark.x), y: 1.35, z: toWorldZ(cameraMark.y) }
    : baseline.camera.position;
  const target = cameraMark
    ? { x: toWorldX(cameraMark.aimX), y: 1.1, z: toWorldZ(cameraMark.aimY) }
    : baseline.camera.target;
  const movementText = planned.horizontal.movement.toLowerCase();
  const movementKind = /handheld/.test(movementText)
    ? ("HANDHELD" as const)
    : /push/.test(movementText)
      ? ("PUSH" as const)
      : /pull/.test(movementText)
        ? ("PULL" as const)
        : /track/.test(movementText)
          ? ("TRACK" as const)
          : /arc/.test(movementText)
            ? ("ARC" as const)
            : ("LOCKED" as const);
  const support = /handheld/.test(movementText)
    ? ("HANDHELD" as const)
    : /gimbal/.test(movementText)
      ? ("GIMBAL" as const)
      : /dolly|push|pull|track/.test(movementText)
        ? ("DOLLY" as const)
        : ("LOCKED" as const);
  const kind = (value: string): SpatialSetPieceState["kind"] => {
    if (value === "TABLE") return "TABLE";
    if (value === "COUNTER" || value === "ISLAND" || value === "SINK") return "COUNTER";
    if (value === "DOOR") return "DOOR";
    if (value === "WINDOW") return "WINDOW";
    if (value === "PRACTICAL") return "PRACTICAL";
    return "OBJECT";
  };
  const colorFor = (value: SpatialSetPieceState["kind"]) =>
    value === "WINDOW"
      ? "#8faeb8"
      : value === "DOOR"
        ? "#73685e"
        : value === "PRACTICAL"
          ? "#c49a57"
          : value === "COUNTER" || value === "TABLE"
            ? "#82796f"
            : "#596164";
  const setPieces: SpatialSetPieceState[] = planned.horizontal.setPieces.map((piece) => {
    const spatialKind = kind(piece.kind);
    const pieceHeight = Math.max(0.15, (piece.height / 100) * 2.5);
    return {
      id: piece.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      label: piece.label,
      kind: spatialKind,
      position: {
        x: toWorldX(piece.x + piece.width / 2),
        y: pieceHeight,
        z: piece.plane === "FOREGROUND" ? 1.3 : piece.plane === "BACKGROUND" ? -1.5 : 0,
      },
      width: Math.max(0.25, piece.width / 12),
      height: pieceHeight,
      depth: Math.max(0.2, piece.width / 35),
      color: colorFor(spatialKind),
    };
  });
  const lightTone = planned.horizontal.light[0]?.tone;
  const subjectPosition = subjectStart
    ? { x: toWorldX(subjectStart.x), y: 0, z: toWorldZ(subjectStart.y) }
    : baseline.subject.position;
  const subjectEndPosition = subjectEnd
    ? { x: toWorldX(subjectEnd.x), y: 0, z: toWorldZ(subjectEnd.y) }
    : subjectPosition;
  return {
    version: 1,
    activeShot: {
      ...baseline,
      id: planned.id,
      title: planned.title,
      camera: {
        position: cameraPosition,
        target,
        focalLengthMm: focalLength,
        aspectRatio: "16:9",
        support,
      },
      subject: {
        ...baseline.subject,
        id: blockingSubject?.id ?? "primary-subject",
        label: blockingSubject?.label ?? planned.horizontal.figures[0]?.label ?? "Subject",
        position: subjectPosition,
        endPosition: subjectEndPosition,
        pose: /sit|seated/i.test(`${scene.action} ${scene.craft.blocking}`) ? "SEATED" : "STANDING",
      },
      movement: {
        kind: movementKind,
        start: cameraPosition,
        end:
          movementKind === "LOCKED"
            ? cameraPosition
            : { ...cameraPosition, z: cameraPosition.z - 1.2 },
      },
      setPieces,
      action: scene.action,
      blocking: scene.craft.blocking,
      lightColor: lightTone === "COOL" ? "#a8bdc4" : lightTone === "WARM" ? "#d1a56d" : "#c8c5bb",
      light: scene.craft.light,
      look: `${scene.craft.color} ${plan.look.texture}`,
      sound: scene.craft.sound,
      productionNotes: `${planned.horizontal.executionStrip.join(" ")} ${planned.horizontal.constraint}`,
      rationale: `${planned.purpose} ${planned.horizontal.constraint}`,
      directionTitle: development.directionDecision.title,
      directionRationale: development.directionDecision.whyThisProject,
      geometryConfidence: "ESTIMATED",
    },
    savedShots: [],
  };
}

function PriorityLabel({ value }: { value: string }) {
  const labels: Record<string, string> = {
    MUST_SOLVE_NOW: "Must solve now",
    IMPORTANT: "Important",
    WORTH_EXPLORING: "Worth exploring",
    OPTIONAL: "Optional",
  };
  return (
    <span className="text-muted-foreground font-mono text-[0.65rem] font-semibold tracking-wide uppercase">
      {labels[value] ?? value}
    </span>
  );
}

function Spine({
  analysis,
  busy,
  onPromoteDirection,
}: {
  analysis: Analysis;
  busy: boolean;
  onPromoteDirection: () => Promise<void>;
}) {
  const spine = analysis.blueprint.development.visualPlan.creativeSpine;
  const priorities = analysis.blueprint.development.visualPlan.priorities;
  const recommendation = analysis.blueprint.development.directionDecision;
  const [promoting, setPromoting] = useState(false);

  async function promote() {
    setPromoting(true);
    try {
      await onPromoteDirection();
    } finally {
      setPromoting(false);
    }
  }
  return (
    <div className="space-y-5">
      <section className="border-border bg-card rounded-lg border p-5">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          The film Stroman believes you are making
        </p>
        <p className="mt-2 max-w-4xl text-xl leading-relaxed">{spine.film}</p>
        <div className="mt-5 grid gap-4 border-t pt-4 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">Why this film</p>
            <p className="mt-1 text-sm leading-relaxed">{spine.why}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">Audience effect</p>
            <p className="mt-1 text-sm leading-relaxed">{spine.audienceEffect}</p>
          </div>
        </div>
      </section>

      <section className="border-border bg-card rounded-lg border p-5" aria-labelledby="direction">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Proposed direction
            </p>
            <h2 id="direction" className="mt-1 text-xl font-semibold">
              {recommendation.title}
            </h2>
            <p className="mt-2 leading-relaxed">{recommendation.pointOfView}</p>
          </div>
          <div className="rounded-md border px-3 py-2 text-right">
            <p className="text-muted-foreground text-[0.65rem] tracking-wide uppercase">
              Working confidence
            </p>
            <p className="font-mono text-lg font-semibold">
              {Math.round((recommendation.confidence ?? 0.5) * 100)}%
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 border-t pt-4 md:grid-cols-2">
          <DeepNote label="Why it matters here" value={recommendation.whyThisProject} />
          <DeepNote label="What it gives up" value={recommendation.sacrifice} />
          <DeepNote label="How the story moves" value={recommendation.storyEngine} />
          <DeepNote
            label="What remains uncertain"
            value={
              recommendation.confidenceRationale ??
              "This remains a working recommendation until the filmmaker confirms it."
            }
          />
        </div>
        <div className="bg-muted/50 mt-5 rounded-md p-4">
          <p className="text-xs font-semibold tracking-wide uppercase">Basis for this proposal</p>
          <ul className="mt-2 space-y-2">
            {(recommendation.basis ?? []).map((item) => (
              <li key={`${item.kind}-${item.label}`} className="text-sm">
                <span className="font-medium">{item.label}:</span>{" "}
                <span className="text-muted-foreground">{item.statement}</span>
              </li>
            ))}
            {(recommendation.basis ?? []).length === 0 ? (
              <li className="text-muted-foreground text-sm">
                Based on the current project intent; source evidence has not yet confirmed it.
              </li>
            ) : null}
          </ul>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={() => void promote()} disabled={busy || promoting}>
            {promoting ? "Opening choice…" : "Turn this into a choice"}
          </Button>
          <p className="text-muted-foreground max-w-xl text-xs">
            Compare this direction with the real alternatives, revise it, reject the set, or leave
            it open. Stroman never decides for you.
          </p>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border-border bg-card rounded-lg border p-5">
          <h2 className="font-semibold">Key beats</h2>
          <ol className="mt-3 space-y-3">
            {spine.keyBeats.map((beat, index) => (
              <li key={beat} className="grid grid-cols-[2rem_1fr] items-start gap-2 text-sm">
                <span className="text-muted-foreground font-mono">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-medium">{beat}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-lg border border-[#69877c] bg-[#eef4f1] p-5">
          <p className="text-xs font-semibold tracking-wide text-[#345448] uppercase">
            Next important decision
          </p>
          <p className="mt-2 text-lg leading-relaxed text-[#243b33]">{spine.nextDecision}</p>
        </section>
      </div>

      <section className="border-border bg-card rounded-lg border p-5">
        <h2 className="font-semibold">Priority</h2>
        <div className="mt-3 divide-y">
          {priorities.map((item) => (
            <article
              key={`${item.priority}-${item.label}`}
              className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[9rem_1fr]"
            >
              <PriorityLabel value={item.priority} />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-muted-foreground mt-1 text-sm">{item.decision}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function DeepRoom({ analysis }: { analysis: Analysis }) {
  const development = analysis.blueprint.development;
  const recommendation = development.directionDecision;
  return (
    <div className="space-y-4">
      <details open className="border-border bg-card rounded-lg border p-5">
        <summary className="cursor-pointer font-semibold">
          Why “{recommendation.title}” wins
        </summary>
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <DeepNote label="Point of view" value={recommendation.pointOfView} />
          <DeepNote label="Story engine" value={recommendation.storyEngine} />
          <DeepNote label="Formal strategy" value={recommendation.formalStrategy} />
          <DeepNote label="Audience journey" value={recommendation.audienceJourney} />
          <DeepNote label="Real sacrifice" value={recommendation.sacrifice} />
          <DeepNote label="Change course if" value={recommendation.changeMyMindIf} />
        </div>
      </details>

      <details className="border-border bg-card rounded-lg border p-5">
        <summary className="cursor-pointer font-semibold">
          Discarded directions and tradeoffs
        </summary>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {development.alternativeDecisions.map((direction) => (
            <article key={direction.title} className="border-border rounded-md border p-3">
              <h3 className="text-sm font-semibold">{direction.title}</h3>
              <p className="mt-2 text-sm">{direction.pointOfView}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                <span className="text-foreground font-medium">Gives up:</span> {direction.sacrifice}
              </p>
              {direction.innovation ? (
                <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-xs">
                  <strong>Purposeful rule-break:</strong> {direction.innovation.departure}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </details>

      <details className="border-border bg-card rounded-lg border p-5">
        <summary className="cursor-pointer font-semibold">
          Detailed scene and craft reasoning
        </summary>
        <div className="mt-4 space-y-3">
          {development.sceneHypotheses.map((scene, index) => (
            <article key={scene.id} className="border-border rounded-md border p-4">
              <p className="text-muted-foreground font-mono text-xs">
                SCENE {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 font-semibold">{scene.title}</h3>
              <p className="mt-2 text-sm">
                <strong>Action:</strong> {scene.action}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                <strong className="text-foreground">Turn:</strong> {scene.turn}
              </p>
              <div className="mt-3 grid gap-3 border-t pt-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                <DeepNote label="Blocking" value={scene.craft.blocking} />
                <DeepNote label="Camera" value={scene.craft.camera} />
                <DeepNote label="Light" value={scene.craft.light} />
                <DeepNote label="Design" value={scene.craft.design} />
                <DeepNote label="Color" value={scene.craft.color} />
                <DeepNote label="Sound" value={scene.craft.sound} />
              </div>
            </article>
          ))}
        </div>
      </details>

      <details className="border-border bg-card rounded-lg border p-5">
        <summary className="cursor-pointer font-semibold">
          Assumptions, questions, and risks
        </summary>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold tracking-wide uppercase">Assumptions</h3>
            <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
              {recommendation.assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-wide uppercase">
              Questions that change the plan
            </h3>
            <ol className="mt-2 space-y-2 text-sm">
              {development.questions.map((question) => (
                <li key={question.prompt}>
                  <strong>{question.prompt}</strong>
                  <span className="text-muted-foreground block text-xs">
                    Changes: {question.decisionItChanges}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </details>
    </div>
  );
}

function DeepNote({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-[0.68rem] tracking-wide uppercase">{label}</p>
      <p className="mt-1 leading-relaxed">{value}</p>
    </div>
  );
}

export function BlueprintView({
  analysis,
  busy,
  error,
  focus,
  onReanalyze,
  onPromoteDirection,
  onStage,
  onProduction,
  onUploadScoutPhotos,
  onCorrection,
  onShotPlanning,
  onPromoteShot,
  onUploadLocation,
  onGetLocationReconstruction,
  onStartLocationReconstruction,
  onRefreshLocationReconstruction,
  onRetryLocationReconstruction,
  onSaveLocation,
}: {
  analysis: Analysis;
  busy: boolean;
  error: string | null;
  focus?: "story" | "storyboard";
  onReanalyze: () => void;
  onPromoteDirection?: () => Promise<void>;
  onStage: (stage: ProductionStage) => Promise<void>;
  onProduction: (production: Partial<ProductionReality>) => Promise<void>;
  onUploadScoutPhotos: (files: readonly File[]) => Promise<void>;
  onCorrection: (statement: string, replacesClaimId: string | null) => Promise<void>;
  onShotPlanning: (state: ShotPlanningState) => Promise<void>;
  onPromoteShot?: (shot: SpatialShotState) => Promise<void>;
  onUploadLocation?: (input: {
    file: File;
    name: string;
    sourceKind: "PHONE_SCAN" | "PHOTOGRAMMETRY" | "ROOMPLAN" | "OTHER";
    unit: "METERS" | "CENTIMETERS" | "MILLIMETERS";
    metricScale: boolean;
  }) => Promise<void>;
  onGetLocationReconstruction?: () => Promise<LocationReconstructionView | null>;
  onStartLocationReconstruction?: (input: {
    readonly name: string;
    readonly photos: readonly File[];
    readonly onProgress?: (uploaded: number, total: number) => void;
  }) => Promise<LocationReconstructionView>;
  onRefreshLocationReconstruction?: (id: string) => Promise<LocationReconstructionView>;
  onRetryLocationReconstruction?: (id: string) => Promise<LocationReconstructionView>;
  onSaveLocation?: (input: {
    workspace: LocationWorkspaceState;
    frame: Blob;
    width: number;
    height: number;
    title: string;
    technicalSummary: string;
    shootingInstructions: string;
    includesUnknownSpace: boolean;
  }) => Promise<void>;
}) {
  const plan = analysis.blueprint.development.visualPlan;
  const defaultDepth: Depth = plan.stage === "IDEA" ? "SPINE" : "BLUEPRINT";
  const [depthChoice, setDepthChoice] = useState<{
    readonly stage: ProductionStage;
    readonly value: Depth;
  }>({ stage: plan.stage, value: defaultDepth });
  const depth =
    focus === "story"
      ? "SPINE"
      : focus === "storyboard"
        ? "BLUEPRINT"
        : depthChoice.stage === plan.stage
          ? depthChoice.value
          : defaultDepth;
  const Heading = focus ? "h2" : "h1";
  return (
    <div className="mb-8 flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Filmmaking workspace
          </p>
          <Heading className="text-2xl font-semibold tracking-tight">
            {analysis.brief.title}
          </Heading>
          <p className="text-muted-foreground text-sm">
            {[analysis.brief.client, analysis.brief.projectType].filter(Boolean).join(" · ") ||
              "Idea-stage project"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReanalyze}>
          Update intent
        </Button>
      </header>

      {analysis.blueprint.development.reasoningSource === "DETERMINISTIC_SPECIALIST" ? (
        <aside
          role="status"
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3"
        >
          <p className="text-sm font-semibold">Offline creative draft</p>
          <p className="text-muted-foreground mt-1 text-sm">
            This is a transparent offline fallback, not hosted project-specific reasoning. Use it as
            a working draft and reconnect creative reasoning before approving the direction.
          </p>
        </aside>
      ) : null}

      {focus !== "story" ? (
        <section className="border-border rounded-lg border p-2" aria-label="Production stage">
          <p className="text-muted-foreground px-2 pt-1 text-[0.65rem] font-semibold tracking-wide uppercase">
            What stage are you solving?
          </p>
          <div className="mt-1 flex flex-wrap gap-1 sm:flex-nowrap sm:overflow-x-auto">
            {stages.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => void onStage(value)}
                disabled={busy}
                aria-pressed={plan.stage === value}
                className={`shrink-0 rounded-md px-3 py-2 text-sm ${plan.stage === value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {!focus ? (
        <nav className="grid gap-2 sm:grid-cols-3" aria-label="Story, plan, and edit workspace">
          {depths.map(([value, label, note]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDepthChoice({ stage: plan.stage, value })}
              aria-current={depth === value ? "page" : undefined}
              className={`rounded-lg border px-4 py-3 text-left ${depth === value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
            >
              <span className="block text-sm font-semibold">{label}</span>
              <span className="text-muted-foreground mt-0.5 block text-xs">{note}</span>
            </button>
          ))}
        </nav>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="text-destructive rounded-md border border-current/20 px-3 py-2 text-sm"
        >
          {error}
        </p>
      ) : null}
      {depth === "SPINE" ? (
        <Spine
          analysis={analysis}
          busy={busy}
          onPromoteDirection={onPromoteDirection ?? (async () => undefined)}
        />
      ) : null}
      {focus === "story" ? (
        <details className="border-border bg-card rounded-lg border p-5">
          <summary className="cursor-pointer font-semibold">
            Explore the reasoning and alternatives
          </summary>
          <div className="mt-4">
            <DeepRoom analysis={analysis} />
          </div>
        </details>
      ) : null}
      {depth === "BLUEPRINT" ? (
        <div className="space-y-5">
          <section className="bg-card rounded-lg border p-5" aria-labelledby="planning-inputs">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Plan from what is real
            </p>
            <h2 id="planning-inputs" className="mt-1 font-semibold">
              Your idea is enough to begin.
            </h2>
            <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
              Add a room only when its real geometry changes the shot. Footage and transcripts stay
              in Edit, where they can shape the cut without crowding this planning view.
            </p>
          </section>
          <ScoutPlanningInput
            plan={plan}
            projectId={analysis.brief.projectId}
            busy={busy}
            onUpload={onUploadScoutPhotos}
            onCorrection={onCorrection}
          />
          <RealLocationWorkspace
            key={`${analysis.brief.planningContext.locationWorkspace?.environment.id ?? "no-location"}:${analysis.brief.planningContext.locationWorkspace?.environment.version ?? 0}:${analysis.brief.planningContext.locationWorkspace?.savedShots.length ?? 0}`}
            projectId={analysis.brief.projectId}
            initial={analysis.brief.planningContext.locationWorkspace ?? null}
            busy={busy}
            shootingInstructions={recommendedSpatialShot(analysis).activeShot.action}
            onUpload={onUploadLocation ?? (async () => undefined)}
            onGetReconstruction={onGetLocationReconstruction ?? (async () => null)}
            onStartReconstruction={
              onStartLocationReconstruction ??
              (async () => {
                throw new Error("Room building is unavailable.");
              })
            }
            onRefreshReconstruction={
              onRefreshLocationReconstruction ??
              (async () => {
                throw new Error("Room building is unavailable.");
              })
            }
            onRetryReconstruction={
              onRetryLocationReconstruction ??
              (async () => {
                throw new Error("Room building is unavailable.");
              })
            }
            onSave={onSaveLocation ?? (async () => undefined)}
          />
          {!analysis.brief.planningContext.locationWorkspace ? (
            <details className="border-border bg-card rounded-lg border p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                Continue with an estimated shot before the scan is ready
              </summary>
              <div className="mt-4">
                <ShotPlanningSpace
                  initial={analysis.brief.planningContext.shotPlanning}
                  proposal={recommendedSpatialShot(analysis)}
                  busy={busy}
                  onSave={onShotPlanning}
                  onPromote={onPromoteShot}
                />
              </div>
            </details>
          ) : null}
          <details className="border-border bg-card rounded-lg border p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Scout grounding, lighting, sound, and coverage
            </summary>
            <div className="mt-4">
              <VisualPlanView
                plan={plan}
                projectId={analysis.brief.projectId}
                busy={busy}
                onUpload={onUploadScoutPhotos}
                onCorrection={onCorrection}
                includeScout={false}
              />
            </div>
          </details>
          <details className="border-border bg-card rounded-lg border p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Production reality · add only what changes the plan
            </summary>
            <div className="mt-4">
              <ProductionRealityForm
                initial={plan.productionReality}
                busy={busy}
                onSave={onProduction}
              />
            </div>
          </details>
        </div>
      ) : null}
      {depth === "DEEP_ROOM" ? (
        <div className="space-y-4">
          <section className="bg-card rounded-lg border p-5">
            <h2 className="font-semibold">Captured material</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Import footage or transcripts below. Stroman keeps source evidence, edit
              recommendations, and the current story together there.
            </p>
          </section>
          <DeepRoom analysis={analysis} />
        </div>
      ) : null}
    </div>
  );
}
