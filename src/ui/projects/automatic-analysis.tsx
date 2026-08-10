"use client";

import { useEffect, useState } from "react";
import { Button } from "@/ui/primitives/button";

interface AnalysisResult {
  run: { id: string; version: number; status: string };
  outputs: Array<{
    id: string;
    kind: string;
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
}

type AnalysisOutput = AnalysisResult["outputs"][number];

function interpretationLabel(kind: string): string {
  switch (kind) {
    case "THEME":
      return "Theme";
    case "NARRATIVE":
      return "Story progression";
    case "INFERENCE":
      return "Inference";
    default:
      return "Interpretation";
  }
}

function FindingList({
  outputs,
  interpretation,
}: {
  outputs: AnalysisOutput[];
  interpretation: boolean;
}) {
  if (outputs.length === 0) {
    return (
      <p className="text-muted-foreground mt-2 text-sm">
        {interpretation
          ? "No strong editorial interpretation is supported yet. More substantive source material may help."
          : "No substantive source-backed moments were identified yet."}
      </p>
    );
  }
  return (
    <ul className="mt-2 space-y-2">
      {outputs.map((output) => (
        <li key={output.id} className="border-border rounded border p-3">
          <div className="text-muted-foreground flex flex-wrap gap-2 text-xs tracking-wide uppercase">
            <span>
              {interpretation
                ? `Editorial interpretation · ${interpretationLabel(output.kind)}`
                : "Source-backed"}
            </span>
            <span>
              · {output.evidenceReferenceIds.length} source
              {output.evidenceReferenceIds.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-1 text-sm">{output.content.replace(/^Source-backed moment:\s*/, "")}</p>
        </li>
      ))}
    </ul>
  );
}

export function AutomaticAnalysis({ projectId }: { projectId: string }) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/v1/projects/${projectId}/automatic-analysis`, {
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error("Saved analysis is temporarily unavailable.");
        return (await response.json()) as AnalysisResult;
      })
      .then((value) => {
        if (active && value) setResult(value);
      })
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Saved analysis is unavailable.");
        }
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/automatic-analysis`, {
        method: "POST",
        credentials: "same-origin",
      });
      const body = (await response.json()) as
        | AnalysisResult
        | {
            error?: { message?: string };
          };
      if (!response.ok) {
        throw new Error(
          "error" in body
            ? (body.error?.message ?? "Analysis could not be completed.")
            : "Analysis could not be completed.",
        );
      }
      setResult(body as AnalysisResult);
      window.dispatchEvent(new Event("stroman:analysis-completed"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="border-border bg-card mb-8 rounded-lg border p-5"
      aria-labelledby="analysis"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="analysis" className="text-lg font-semibold">
            Evidence-grounded analysis
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Create observations, themes, and an editorial starting point from imported transcripts.
            Every claim keeps its source evidence; recommendations remain advisory.
          </p>
        </div>
        <Button type="button" onClick={run} disabled={busy}>
          {busy ? "Analyzing…" : result ? "Run new analysis" : "Analyze transcripts"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-destructive mt-4 text-sm">
          {error}
        </p>
      ) : null}
      {result ? (
        <div className="mt-5 space-y-5" aria-live="polite">
          <p className="text-muted-foreground text-xs">
            Analysis version {result.run.version} · {result.run.status.toLowerCase()}
          </p>
          <div>
            <h3 className="text-sm font-semibold">Source-backed moments</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Direct transcript evidence. These moments are factual source material, not story
              conclusions.
            </p>
            <FindingList
              outputs={result.outputs.filter((output) => output.kind === "OBSERVATION")}
              interpretation={false}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Editorial interpretations to test</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Evidence-grounded patterns and possible story connections. Confirm, revise, or reject
              them against the fuller material.
            </p>
            <FindingList
              outputs={result.outputs.filter((output) => output.kind !== "OBSERVATION")}
              interpretation
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Filmmaker-controlled editorial tests</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Suggestions are starting points, never automatic creative decisions.
            </p>
            {result.recommendations.map((recommendation) => (
              <article
                key={recommendation.id}
                className="border-primary/40 mt-2 rounded border p-3"
              >
                <h4 className="text-sm font-medium">{recommendation.title}</h4>
                <p className="text-muted-foreground mt-1 text-sm">{recommendation.rationale}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {Math.round(recommendation.confidence * 100)}% confidence ·{" "}
                  {recommendation.evidenceReferenceIds.length} evidence source
                  {recommendation.evidenceReferenceIds.length === 1 ? "" : "s"}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
