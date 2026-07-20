"use client";

import { Button } from "@/ui/primitives/button";
import type { Analysis } from "./creative-api";

function Section({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border bg-card flex flex-col gap-2 rounded-lg border p-4">
      <h2 className="text-sm font-semibold">
        <span className="text-muted-foreground">{index}. </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="text-muted-foreground flex list-disc flex-col gap-1 pl-5 text-sm">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * The Creative Blueprint — Stroman OS's structured reading of the project. Reads
 * as a creative brief from a collaborator, not a database record.
 */
export function BlueprintView({
  analysis,
  onReanalyze,
}: {
  analysis: Analysis;
  onReanalyze: () => void;
}) {
  const { brief, blueprint } = analysis;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Creative Blueprint
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{brief.title}</h1>
          <p className="text-muted-foreground text-sm">
            {brief.client} · {brief.projectType}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReanalyze}>
          Re-analyze
        </Button>
      </header>

      <Section index={1} title="Project Summary">
        <p className="text-muted-foreground text-sm">{blueprint.projectSummary}</p>
      </Section>
      <Section index={2} title="Story Objective">
        <p className="text-muted-foreground text-sm">{blueprint.storyObjective}</p>
      </Section>
      <Section index={3} title="Audience Analysis">
        <p className="text-muted-foreground text-sm">{blueprint.audienceAnalysis}</p>
      </Section>
      <Section index={4} title="Emotional Arc">
        <List items={blueprint.emotionalArc} />
      </Section>
      <Section index={5} title="Recommended Story Structure">
        <p className="text-muted-foreground text-sm">{blueprint.recommendedStructure}</p>
      </Section>
      <Section index={6} title="Three Hook Concepts">
        <ul className="flex flex-col gap-2 text-sm">
          {blueprint.hookConcepts.map((hook, i) => (
            <li key={i} className="border-border rounded-md border p-3">
              <span className="font-medium">{hook.title}</span>
              <span className="text-muted-foreground block">{hook.description}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Section index={7} title="Editing Blueprint">
        <List items={blueprint.editingBlueprint} />
      </Section>
      <Section index={8} title="Interview Strategy">
        {blueprint.interviewStrategy ? (
          <List items={blueprint.interviewStrategy} />
        ) : (
          <p className="text-muted-foreground text-sm">Not applicable for this format.</p>
        )}
      </Section>
      <Section index={9} title="B-roll Priorities">
        <List items={blueprint.brollPriorities} />
      </Section>
      <Section index={10} title="Risks">
        <List items={blueprint.risks} />
      </Section>
      <Section index={11} title="Master Prompt">
        <pre className="border-border bg-background overflow-x-auto rounded-md border p-3 text-xs whitespace-pre-wrap">
          {blueprint.masterPrompt}
        </pre>
      </Section>
    </div>
  );
}
