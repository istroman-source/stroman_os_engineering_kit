"use client";

import { useCallback, useEffect, useState } from "react";

interface EditEngineResult {
  analysisVersion: number;
  story: {
    summary: string;
    objective: string;
    structure: string;
    emotionalArc: string[];
  };
  strongestObservations: Array<{
    id: string;
    content: string;
    confidence: number | null;
    evidenceReferenceIds: string[];
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    rationale: string;
    confidence: number;
    evidenceReferenceIds: string[];
  }>;
  alternatives: Array<{ title: string; description: string }>;
}

export function EditEngine({ projectId }: { projectId: string }) {
  const [result, setResult] = useState<EditEngineResult | null>(null);

  const load = useCallback(async () => {
    const response = await fetch(`/api/v1/projects/${projectId}/edit-engine`, {
      credentials: "same-origin",
    });
    if (response.status === 404) return;
    if (response.ok) setResult((await response.json()) as EditEngineResult);
  }, [projectId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    const refresh = () => void load();
    window.addEventListener("stroman:analysis-completed", refresh);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("stroman:analysis-completed", refresh);
    };
  }, [load]);

  if (!result) return null;

  return (
    <section
      className="border-border bg-card mb-8 rounded-lg border p-5"
      aria-labelledby="edit-engine"
    >
      <p className="text-muted-foreground text-xs tracking-wide uppercase">
        Edit Engine · analysis version {result.analysisVersion}
      </p>
      <h2 id="edit-engine" className="mt-1 text-xl font-semibold">
        Your edit so far
      </h2>
      <p className="mt-3 text-sm">{result.story.summary}</p>
      <p className="text-muted-foreground mt-2 text-sm">{result.story.objective}</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">What the footage proves</h3>
          <ul className="mt-2 space-y-2">
            {result.strongestObservations.map((item) => (
              <li key={item.id} className="border-border rounded border p-3 text-sm">
                {item.content}
                <span className="text-muted-foreground mt-1 block text-xs">
                  {item.evidenceReferenceIds.length} evidence source
                  {item.evidenceReferenceIds.length === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Ways to shape the edit</h3>
          <ul className="mt-2 space-y-2">
            {result.recommendations.map((item) => (
              <li key={item.id} className="border-primary/40 rounded border p-3">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-muted-foreground mt-1 text-sm">{item.rationale}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {Math.round(item.confidence * 100)}% confidence ·{" "}
                  {item.evidenceReferenceIds.length} evidence source
                  {item.evidenceReferenceIds.length === 1 ? "" : "s"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-5">
        <h3 className="text-sm font-semibold">Other approaches to consider</h3>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {result.alternatives.map((item) => (
            <article key={item.title} className="border-border rounded border p-3">
              <h4 className="text-sm font-medium">{item.title}</h4>
              <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
