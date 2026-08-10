"use client";

import { Button } from "@/ui/primitives/button";
import type { DirectionDecision, SceneCraft } from "@/domain/creative";
import type { Analysis } from "./creative-api";
import { StoryboardArtifactView } from "./storyboard-artifact";

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

function Note({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-[0.68rem] tracking-[0.14em] uppercase">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed">{value}</dd>
    </div>
  );
}

function Innovation({ direction }: { direction: DirectionDecision }) {
  const innovation = direction.innovation;
  if (!innovation) return null;
  return (
    <aside className="mt-3 rounded-md border border-amber-500/35 bg-amber-500/5 p-3">
      <p className="text-xs font-semibold tracking-wide uppercase">Purposeful rule-break</p>
      <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
        <Note label="Convention" value={innovation.convention} />
        <Note label="Why it works" value={innovation.whyConventionWorks} />
        <Note label="Exact departure" value={innovation.departure} />
        <Note label="Why here" value={innovation.projectBenefit} />
        <Note label="Execution risk" value={innovation.executionRisk} />
      </dl>
    </aside>
  );
}

function CraftLine({ craft }: { craft: SceneCraft }) {
  return (
    <dl className="mt-3 grid gap-2 border-t border-dashed pt-3 text-xs md:grid-cols-2">
      <Note label="Blocking" value={craft.blocking} />
      <Note label="Camera" value={craft.camera} />
      <Note label="Light" value={craft.light} />
      <Note label="Design / color" value={`${craft.design} ${craft.color}`} />
      <Note label="Sound" value={craft.sound} />
    </dl>
  );
}

export function BlueprintView({
  analysis,
  onReanalyze,
}: {
  analysis: Analysis;
  onReanalyze: () => void;
}) {
  const { brief, blueprint } = analysis;
  const development = blueprint.development;
  const recommendation = development.directionDecision;

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
          Scenes and meanings below are proposals to test. Supplied constraints remain binding; the
          filmmaker retains final authority.
        </span>
      </p>

      <Section title="The creative thesis">
        <p className="text-lg leading-relaxed">{development.insight.thesis}</p>
        <dl className="grid gap-4 border-t border-dashed pt-3 md:grid-cols-3">
          <Note label="Human truth" value={development.insight.humanTruth} />
          <Note label="Dramatic tension" value={development.insight.dramaticTension} />
          <Note label="Audience promise" value={development.insight.audiencePromise} />
        </dl>
      </Section>

      <Section title="Recommendation">
        <article className="border-primary/50 rounded-lg border p-4">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            Commit to this direction
          </p>
          <h3 className="mt-1 text-xl font-semibold">{recommendation.title}</h3>
          <p className="mt-2 text-sm leading-relaxed">{recommendation.pointOfView}</p>
          <dl className="mt-4 grid gap-4 md:grid-cols-2">
            <Note label="Story engine" value={recommendation.storyEngine} />
            <Note label="Formal strategy" value={recommendation.formalStrategy} />
            <Note label="Audience journey" value={recommendation.audienceJourney} />
            <Note label="Why this project" value={recommendation.whyThisProject} />
          </dl>
          <div className="bg-muted/45 mt-4 grid gap-3 rounded-md p-3 md:grid-cols-2">
            <Note label="What we sacrifice" value={recommendation.sacrifice} />
            <Note label="Change this recommendation if…" value={recommendation.changeMyMindIf} />
          </div>
          <h4 className="mt-4 text-xs font-semibold tracking-wide uppercase">
            Assumptions to verify
          </h4>
          <List items={recommendation.assumptions} />
          <Innovation direction={recommendation} />
        </article>
      </Section>

      <Section title="Real alternatives">
        <div className="grid gap-3 lg:grid-cols-3">
          {development.alternativeDecisions.map((direction) => (
            <article key={direction.title} className="border-border rounded-md border p-3">
              <h3 className="text-sm font-semibold">{direction.title}</h3>
              <p className="mt-2 text-sm">{direction.pointOfView}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                <span className="text-foreground font-medium">Gives up:</span> {direction.sacrifice}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                <span className="text-foreground font-medium">Change course if:</span>{" "}
                {direction.changeMyMindIf}
              </p>
              <Innovation direction={direction} />
            </article>
          ))}
        </div>
      </Section>

      <Section title="Scenes worth making">
        <div className="space-y-4">
          {development.sceneHypotheses.map((scene, index) => (
            <article key={scene.id} className="border-border rounded-md border p-4">
              <div className="grid gap-1 sm:grid-cols-[2.5rem_1fr]">
                <span className="text-muted-foreground font-mono text-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-semibold">{scene.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed">
                    <span className="font-medium">Action:</span> {scene.action}
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    <span className="text-foreground font-medium">Turn:</span> {scene.turn}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    <span className="text-foreground font-medium">Why it matters:</span>{" "}
                    {scene.purpose}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    <span className="text-foreground font-medium">Constraint:</span>{" "}
                    {scene.constraintHandling}
                  </p>
                  <CraftLine craft={scene.craft} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <StoryboardArtifactView artifact={development.storyboard} />

      <Section title="Director notebook · shot & beat cards">
        <div className="grid gap-3 md:grid-cols-2">
          {development.directorNotebook.map((beat) => (
            <article key={beat.id} className="border-border rounded-md border p-3">
              <h3 className="font-mono text-sm font-semibold">{beat.shot}</h3>
              <p className="mt-2 text-sm">{beat.visual}</p>
              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <Note label="Camera" value={beat.camera} />
                <Note label="Light" value={beat.light} />
                <Note label="Sound" value={beat.sound} />
                <Note label="Beat earns" value={beat.purpose} />
              </dl>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Questions that could change the plan">
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

      <Section title="Next production tests">
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
    </div>
  );
}
