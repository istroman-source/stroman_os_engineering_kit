"use client";

import { useState } from "react";
import type { ProductionReality, ProductionStage } from "@/domain/creative";
import { Button } from "@/ui/primitives/button";
import type { Analysis } from "./creative-api";
import { ProductionRealityForm, VisualPlanView } from "./visual-plan";

type Depth = "SPINE" | "BLUEPRINT" | "DEEP_ROOM";

const stages: ReadonlyArray<readonly [ProductionStage, string]> = [
  ["IDEA", "Idea"],
  ["SCOUTING", "Scouting"],
  ["PRE_PRODUCTION", "Pre-production"],
  ["SHOOTING", "Shooting"],
  ["POST", "Post"],
];

const depths: ReadonlyArray<readonly [Depth, string, string]> = [
  ["SPINE", "Creative spine", "What matters now"],
  ["BLUEPRINT", "Blueprint", "How to execute"],
  ["DEEP_ROOM", "Deep room", "Reasoning and alternatives"],
];

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

function Spine({ analysis }: { analysis: Analysis }) {
  const spine = analysis.blueprint.development.visualPlan.creativeSpine;
  const priorities = analysis.blueprint.development.visualPlan.priorities;
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
  onReanalyze,
  onStage,
  onProduction,
  onUploadScoutPhotos,
  onCorrection,
}: {
  analysis: Analysis;
  busy: boolean;
  error: string | null;
  onReanalyze: () => void;
  onStage: (stage: ProductionStage) => Promise<void>;
  onProduction: (production: Partial<ProductionReality>) => Promise<void>;
  onUploadScoutPhotos: (files: readonly File[]) => Promise<void>;
  onCorrection: (statement: string, replacesClaimId: string | null) => Promise<void>;
}) {
  const plan = analysis.blueprint.development.visualPlan;
  const defaultDepth: Depth = plan.stage === "IDEA" ? "SPINE" : "BLUEPRINT";
  const [depthChoice, setDepthChoice] = useState<{
    readonly stage: ProductionStage;
    readonly value: Depth;
  }>({ stage: plan.stage, value: defaultDepth });
  const depth = depthChoice.stage === plan.stage ? depthChoice.value : defaultDepth;
  return (
    <div className="mb-8 flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Develop &amp; Plan
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{analysis.brief.title}</h1>
          <p className="text-muted-foreground text-sm">
            {[analysis.brief.client, analysis.brief.projectType].filter(Boolean).join(" · ") ||
              "Idea-stage project"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReanalyze}>
          Update intent
        </Button>
      </header>

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

      <nav className="grid gap-2 sm:grid-cols-3" aria-label="Creative plan depth">
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

      {error ? (
        <p
          role="alert"
          className="text-destructive rounded-md border border-current/20 px-3 py-2 text-sm"
        >
          {error}
        </p>
      ) : null}
      {depth === "SPINE" ? <Spine analysis={analysis} /> : null}
      {depth === "BLUEPRINT" ? (
        <div className="space-y-5">
          <VisualPlanView
            plan={plan}
            projectId={analysis.brief.projectId}
            busy={busy}
            onUpload={onUploadScoutPhotos}
            onCorrection={onCorrection}
          />
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
      {depth === "DEEP_ROOM" ? <DeepRoom analysis={analysis} /> : null}
    </div>
  );
}
