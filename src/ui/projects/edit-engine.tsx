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
  evidenceBridge: {
    intended: { goal: string; audience: string; success: string };
    captured: EditEngineResult["strongestObservations"];
    supportedStory: Array<
      EditEngineResult["strongestObservations"][number] & { counterEvidencePrompt: string }
    >;
    potentialBeyondBrief: EditEngineResult["strongestObservations"];
    missing: EditEngineResult["strongestObservations"];
    nextAction: EditEngineResult["recommendations"][number] | null;
  };
}

function EmptyBridgeState({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mt-2 text-sm">{children}</p>;
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
        Intent → evidence
      </h2>
      <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
        See what you intended, what the material actually supports, and what still needs your
        judgment.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <article className="border-border rounded border p-3">
          <h3 className="text-xs font-semibold tracking-wide uppercase">Intended</h3>
          <p className="mt-2 text-sm">{result.evidenceBridge.intended.goal}</p>
          <p className="text-muted-foreground mt-2 text-xs">
            For {result.evidenceBridge.intended.audience}
          </p>
        </article>
        <article className="border-border rounded border p-3 md:col-span-2">
          <h3 className="text-xs font-semibold tracking-wide uppercase">Success means</h3>
          <p className="mt-2 text-sm">{result.evidenceBridge.intended.success}</p>
        </article>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <article>
          <h3 className="text-sm font-semibold">Captured</h3>
          {result.evidenceBridge.captured.length === 0 ? (
            <EmptyBridgeState>
              No substantive source-backed moment is confirmed yet.
            </EmptyBridgeState>
          ) : (
            <ul className="mt-2 space-y-2">
              {result.evidenceBridge.captured.map((item) => (
                <li key={item.id} className="border-border rounded border p-3 text-sm">
                  {item.content}
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {item.evidenceReferenceIds.length} cited source
                    {item.evidenceReferenceIds.length === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
        <article>
          <h3 className="text-sm font-semibold">Story the material supports</h3>
          {result.evidenceBridge.supportedStory.length === 0 ? (
            <EmptyBridgeState>
              The evidence does not support a confident story interpretation yet.
            </EmptyBridgeState>
          ) : (
            <ul className="mt-2 space-y-2">
              {result.evidenceBridge.supportedStory.map((item) => (
                <li key={item.id} className="border-border rounded border p-3">
                  <p className="text-sm">{item.content}</p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {item.confidence === null
                      ? "Confidence not scored"
                      : `${Math.round(item.confidence * 100)}% confidence`}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    What could challenge this: {item.counterEvidencePrompt}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <article>
          <h3 className="text-sm font-semibold">Potential beyond the brief</h3>
          {result.evidenceBridge.potentialBeyondBrief.length === 0 ? (
            <EmptyBridgeState>
              No evidence-backed expansion beyond the supplied intent is clear yet.
            </EmptyBridgeState>
          ) : (
            <ul className="mt-2 space-y-2">
              {result.evidenceBridge.potentialBeyondBrief.map((item) => (
                <li key={item.id} className="border-border rounded border p-3 text-sm">
                  {item.content}
                </li>
              ))}
            </ul>
          )}
        </article>
        <article>
          <h3 className="text-sm font-semibold">Still missing</h3>
          {result.evidenceBridge.missing.length === 0 ? (
            <EmptyBridgeState>
              No specific gap was identified automatically. Confirm coverage before locking the
              edit.
            </EmptyBridgeState>
          ) : (
            <ul className="mt-2 space-y-2">
              {result.evidenceBridge.missing.map((item) => (
                <li key={item.id} className="border-border rounded border p-3 text-sm">
                  {item.content}
                </li>
              ))}
            </ul>
          )}
        </article>
        <article className="border-primary/40 rounded border p-3">
          <h3 className="text-sm font-semibold">Next creative choice</h3>
          {result.evidenceBridge.nextAction ? (
            <>
              <p className="mt-2 text-sm font-medium">{result.evidenceBridge.nextAction.title}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {result.evidenceBridge.nextAction.rationale}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                {Math.round(result.evidenceBridge.nextAction.confidence * 100)}% confidence · a
                proposal for your review
              </p>
            </>
          ) : (
            <EmptyBridgeState>
              Gather more substantive material before committing to an edit direction.
            </EmptyBridgeState>
          )}
        </article>
      </div>
    </section>
  );
}
