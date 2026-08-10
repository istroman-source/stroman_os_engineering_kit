"use client";

import { Button } from "@/ui/primitives/button";
import type { Analysis } from "./creative-api";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="text-muted-foreground flex list-disc flex-col gap-1.5 pl-5 text-sm">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function NotebookNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border/70 border-b border-dashed pb-3">
      <dt className="text-muted-foreground text-[0.7rem] tracking-[0.16em] uppercase">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed">{value}</dd>
    </div>
  );
}

/**
 * A filmmaker-facing development result. Internal candidate search stays hidden;
 * the screen presents a point of view, real alternatives, and a concise director
 * notebook rather than model deliberation or persistence details.
 */
export function BlueprintView({
  analysis,
  onReanalyze,
}: {
  analysis: Analysis;
  onReanalyze: () => void;
}) {
  const { brief, blueprint } = analysis;
  const development = blueprint.development;
  const director = development.directorBlueprint;

  return (
    <div className="mb-8 flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Develop &amp; Plan · {development.mode.toLowerCase()}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{brief.title}</h1>
          <p className="text-muted-foreground text-sm">
            {[brief.client, brief.projectType].filter(Boolean).join(" · ") || "Idea-stage project"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReanalyze}>
          Update intent
        </Button>
      </header>

      <p className="border-primary/30 bg-primary/5 rounded-lg border px-4 py-3 text-sm">
        <span className="font-medium">Creative hypothesis, not source evidence.</span>{" "}
        <span className="text-muted-foreground">
          This development pass uses project intent only. Proposed scenes, shots, and meanings must
          be tested by the filmmaker.
        </span>
      </p>

      <Section title="Creative read">
        <p className="text-sm leading-relaxed">{development.objectiveRead}</p>
        <article className="border-primary/50 rounded-lg border p-4">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            Recommended direction
          </p>
          <h3 className="mt-1 text-lg font-semibold">{development.recommendedDirection.title}</h3>
          <p className="mt-2 text-sm leading-relaxed">{development.recommendedDirection.thesis}</p>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            <NotebookNote
              label="Why this wins"
              value={development.recommendedDirection.whyThisWins}
            />
            <NotebookNote
              label="Audience effect"
              value={development.recommendedDirection.audienceEffect}
            />
            <NotebookNote
              label="Organizing principle"
              value={development.recommendedDirection.organizingPrinciple}
            />
            <NotebookNote label="Execution" value={development.recommendedDirection.execution} />
          </dl>
          <p className="text-muted-foreground mt-3 text-sm">
            <span className="text-foreground font-medium">Tradeoff:</span>{" "}
            {development.recommendedDirection.tradeoff}
          </p>
        </article>
        <aside className="border-destructive/30 bg-destructive/5 rounded-md border p-3 text-sm">
          <span className="font-semibold">Creative challenge:</span> {development.creativeChallenge}
        </aside>
      </Section>

      <Section title="Distinct directions worth testing">
        <div className="grid gap-3 lg:grid-cols-3">
          {development.alternatives.map((direction) => (
            <article key={direction.title} className="border-border rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold">{direction.title}</h3>
                {direction.unconventional ? (
                  <span className="border-primary/40 text-primary rounded-full border px-2 py-0.5 text-[0.65rem] tracking-wide uppercase">
                    Purposeful rule-break
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm">{direction.thesis}</p>
              <p className="text-muted-foreground mt-2 text-xs">{direction.audienceEffect}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                <span className="text-foreground font-medium">Cost:</span> {direction.tradeoff}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Questions that change the plan">
        <ol className="space-y-3">
          {development.questions.map((question, index) => (
            <li key={question.prompt} className="grid gap-1 sm:grid-cols-[2rem_1fr]">
              <span className="text-muted-foreground font-mono text-sm">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-medium">{question.prompt}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Changes: {question.decisionItChanges}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Sequence sketch">
        <div className="grid gap-3 lg:grid-cols-3">
          {development.sequencePlan.map((sequence) => (
            <article key={sequence.title} className="border-border rounded-md border p-3">
              <h3 className="font-mono text-sm font-semibold">{sequence.title}</h3>
              <p className="mt-2 text-sm">{sequence.purpose}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                <span className="text-foreground font-medium">Picture:</span> {sequence.picture}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                <span className="text-foreground font-medium">Sound:</span> {sequence.sound}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <section
        className="border-border bg-card rounded-lg border p-4 shadow-[inset_0_0_0_1px_hsl(var(--border))]"
        aria-labelledby="director-notebook"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dashed pb-3">
          <div>
            <p className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
              Structured director notebook · frame renderer not connected
            </p>
            <h2 id="director-notebook" className="mt-1 text-lg font-semibold">
              {director.sequenceTitle}
            </h2>
          </div>
          <span className="border-border rounded border px-2 py-1 font-mono text-[0.65rem] tracking-wide uppercase">
            Hand-drawn contract
          </span>
        </div>
        <dl className="mt-4 grid gap-x-5 gap-y-3 md:grid-cols-2">
          <NotebookNote label="Scene purpose" value={director.scenePurpose} />
          <NotebookNote label="Emotional target" value={director.emotionalTarget} />
          <NotebookNote label="Composition" value={director.composition} />
          <NotebookNote label="Blocking" value={director.blocking} />
          <NotebookNote label="Camera / lens" value={director.camera} />
          <NotebookNote label="Practicals / lighting" value={director.practicalsAndLighting} />
          <NotebookNote label="Background / design" value={director.backgroundAndDesign} />
          <NotebookNote label="Color / grade" value={director.colorAndGrade} />
          <NotebookNote label="Movement" value={director.movement} />
          <NotebookNote label="Sound / atmosphere" value={director.soundAndAtmosphere} />
        </dl>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-mono text-xs tracking-wide uppercase">Must get</h3>
            <List items={director.mustGet} />
          </div>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Optional exploration:</span>{" "}
              <span className="text-muted-foreground">{director.optionalExploration}</span>
            </p>
            <p>
              <span className="font-medium">Risk:</span>{" "}
              <span className="text-muted-foreground">{director.risk}</span>
            </p>
          </div>
        </div>
        <p className="text-muted-foreground mt-4 border-t border-dashed pt-3 text-xs">
          {director.rendering.limitation}
        </p>
      </section>

      <Section title="Production next steps">
        <List items={development.productionNextSteps} />
        {blueprint.interviewStrategy ? (
          <>
            <h3 className="pt-2 text-xs font-semibold tracking-wide uppercase">
              Interview strategy
            </h3>
            <List items={blueprint.interviewStrategy} />
          </>
        ) : null}
      </Section>

      <Section title="Production prompt">
        <p className="text-muted-foreground text-xs">
          Provider-neutral handoff. Review it before using an approved production or ideation tool.
        </p>
        <pre className="border-border bg-background overflow-x-auto rounded-md border p-3 text-xs whitespace-pre-wrap">
          {blueprint.masterPrompt}
        </pre>
      </Section>
    </div>
  );
}
