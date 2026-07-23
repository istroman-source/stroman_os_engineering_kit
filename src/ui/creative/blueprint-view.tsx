"use client";

import { Button } from "@/ui/primitives/button";
import type { Analysis } from "./creative-api";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-border bg-card flex flex-col gap-2 rounded-lg border p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
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
          <p className="text-muted-foreground text-xs tracking-wide uppercase">Story Workspace</p>
          <h1 className="text-2xl font-semibold tracking-tight">{brief.title}</h1>
          <p className="text-muted-foreground text-sm">
            {brief.client} · {brief.projectType}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReanalyze}>
          Update intent
        </Button>
      </header>

      <Section title="Current story">
        <p className="text-muted-foreground text-sm">{blueprint.projectSummary}</p>
        <p className="text-muted-foreground text-sm">{blueprint.recommendedStructure}</p>
      </Section>
      <Section title="Creative intent">
        <p className="text-muted-foreground text-sm">{blueprint.storyObjective}</p>
        <p className="text-muted-foreground text-sm">{blueprint.audienceAnalysis}</p>
        <List items={blueprint.emotionalArc} />
      </Section>
      <Section title="Creative alternatives">
        <ul className="flex flex-col gap-2 text-sm">
          {blueprint.hookConcepts.map((hook, i) => (
            <li key={i} className="border-border rounded-md border p-3">
              <span className="font-medium">{hook.title}</span>
              <span className="text-muted-foreground block">{hook.description}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Edit recommendations">
        <List items={blueprint.editingBlueprint} />
        <h3 className="pt-2 text-xs font-semibold tracking-wide uppercase">Interview strategy</h3>
        {blueprint.interviewStrategy ? (
          <List items={blueprint.interviewStrategy} />
        ) : (
          <p className="text-muted-foreground text-sm">Not applicable for this format.</p>
        )}
        <h3 className="pt-2 text-xs font-semibold tracking-wide uppercase">B-roll priorities</h3>
        <List items={blueprint.brollPriorities} />
        <h3 className="pt-2 text-xs font-semibold tracking-wide uppercase">Watch-outs</h3>
        <List items={blueprint.risks} />
      </Section>
      <Section title="Production prompt">
        <p className="text-muted-foreground text-xs">
          Ready to copy into an approved production or ideation tool.
        </p>
        <pre className="border-border bg-background overflow-x-auto rounded-md border p-3 text-xs whitespace-pre-wrap">
          {blueprint.masterPrompt}
        </pre>
      </Section>
    </div>
  );
}
