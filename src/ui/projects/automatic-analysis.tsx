"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/ui/primitives/button";
import { proposeDecision } from "@/ui/decisions/decisions-api";

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

interface EvidenceInspection {
  id: string;
  kind: "MEDIA_ASSET" | "TRANSCRIPT_SEGMENT";
  source: { id: string; name: string; mediaType: string };
  transcript: null | {
    title: string;
    segmentId: string;
    speaker: string | null;
    text: string;
    startMs: number | null;
    endMs: number | null;
    contextBefore: string | null;
    contextAfter: string | null;
  };
  frame: null | {
    index: number;
    timestampMs: number;
    contentType: string;
    byteSize: number;
    url: string;
  };
  limitation: string | null;
}

function formatTime(value: number | null): string | null {
  if (value === null) return null;
  const minutes = Math.floor(value / 60_000);
  const seconds = ((value % 60_000) / 1_000).toFixed(1).padStart(4, "0");
  return `${minutes}:${seconds}`;
}

function EvidenceInspector({ projectId, ids }: { projectId: string; ids: string[] }) {
  const [selected, setSelected] = useState<EvidenceInspection | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function inspect(id: string) {
    if (selected?.id === id) {
      setSelected(null);
      return;
    }
    setLoading(id);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/projects/${projectId}/evidence/${encodeURIComponent(id)}`,
        { credentials: "same-origin" },
      );
      if (!response.ok) throw new Error("Source evidence is temporarily unavailable.");
      setSelected((await response.json()) as EvidenceInspection);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Source evidence is unavailable.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2">
        {ids.map((id, index) => (
          <Button key={id} type="button" variant="secondary" onClick={() => void inspect(id)}>
            {loading === id
              ? "Opening source…"
              : selected?.id === id
                ? "Close source"
                : `Inspect source ${index + 1}`}
          </Button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-destructive mt-2 text-xs">
          {error}
        </p>
      ) : null}
      {selected ? (
        <aside className="bg-muted/40 mt-2 rounded border p-3" aria-label="Source evidence">
          <p className="text-xs font-medium">{selected.source.name}</p>
          {selected.transcript ? (
            <div className="mt-2 space-y-2 text-sm">
              {selected.transcript.contextBefore ? (
                <p className="text-muted-foreground">…{selected.transcript.contextBefore}</p>
              ) : null}
              <blockquote className="border-primary border-l-2 pl-3">
                {selected.transcript.speaker ? (
                  <span className="font-medium">{selected.transcript.speaker}: </span>
                ) : null}
                {selected.transcript.text}
                {formatTime(selected.transcript.startMs) ? (
                  <span className="text-muted-foreground ml-2 text-xs">
                    {formatTime(selected.transcript.startMs)}–
                    {formatTime(selected.transcript.endMs)}
                  </span>
                ) : null}
              </blockquote>
              {selected.transcript.contextAfter ? (
                <p className="text-muted-foreground">{selected.transcript.contextAfter}…</p>
              ) : null}
            </div>
          ) : selected.frame ? (
            <figure className="mt-2">
              {/* The URL is an owner-scoped same-origin route, never provider-controlled HTML. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.frame.url}
                alt={`Exact sampled frame at ${formatTime(selected.frame.timestampMs) ?? "source time"}`}
                className="max-h-80 w-full rounded border object-contain"
              />
              <figcaption className="text-muted-foreground mt-1 text-xs">
                Exact sampled frame · {formatTime(selected.frame.timestampMs)}
              </figcaption>
            </figure>
          ) : (
            <p className="text-muted-foreground mt-1 text-xs">
              Video or audio source. Use the cited time in the finding to inspect the original.
            </p>
          )}
          {selected.limitation ? (
            <p className="text-muted-foreground mt-2 text-xs">{selected.limitation}</p>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}

function interpretationLabel(kind: string): string {
  switch (kind) {
    case "THEME":
      return "Theme";
    case "NARRATIVE":
      return "Story progression";
    case "INFERENCE":
      return "Inference";
    case "PROMPT":
      return "Unknown to verify";
    default:
      return "Interpretation";
  }
}

function counterEvidencePrompt(kind: string): string {
  switch (kind) {
    case "NARRATIVE":
      return "Check whether omitted or later material changes this proposed progression.";
    case "THEME":
      return "Check whether this pattern holds across the full material, not only the cited moments.";
    case "INFERENCE":
      return "Look for source material that directly contradicts this inference.";
    default:
      return "Review neighboring and contradictory source material before accepting this interpretation.";
  }
}

function FindingList({
  projectId,
  outputs,
  interpretation,
}: {
  projectId: string;
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
  const timestamp = (output: AnalysisOutput) => {
    const match = output.content.match(/^\[OBSERVED @ (\d+):(\d+(?:\.\d+)?)\]/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : Number.POSITIVE_INFINITY;
  };
  const displayed = interpretation
    ? outputs
    : [...outputs].sort((left, right) => timestamp(left) - timestamp(right));
  return (
    <ul className="mt-2 space-y-2">
      {displayed.map((output) => (
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
          {interpretation ? (
            <div className="text-muted-foreground mt-2 space-y-1 text-xs">
              <p>
                {output.confidence === null
                  ? "Confidence not scored"
                  : `${Math.round(output.confidence * 100)}% confidence`}
              </p>
              <p>What could challenge this: {counterEvidencePrompt(output.kind)}</p>
            </div>
          ) : null}
          <EvidenceInspector projectId={projectId} ids={output.evidenceReferenceIds} />
        </li>
      ))}
    </ul>
  );
}

export function AutomaticAnalysis({ projectId }: { projectId: string }) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [decisionLinks, setDecisionLinks] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const loadLatest = useCallback(async () => {
    const response = await fetch(`/api/v1/projects/${projectId}/automatic-analysis`, {
      credentials: "same-origin",
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Saved analysis is temporarily unavailable.");
    return (await response.json()) as AnalysisResult;
  }, [projectId]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      loadLatest()
        .then((value) => {
          if (active && value) setResult(value);
        })
        .catch((caught) => {
          if (active) {
            setError(caught instanceof Error ? caught.message : "Saved analysis is unavailable.");
          }
        });
    };
    refresh();
    window.addEventListener("stroman:analysis-completed", refresh);
    return () => {
      active = false;
      window.removeEventListener("stroman:analysis-completed", refresh);
    };
  }, [loadLatest]);

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

  async function promoteRecommendation(recommendation: AnalysisResult["recommendations"][number]) {
    setPromoting(recommendation.id);
    setError(null);
    try {
      const decision = await proposeDecision({
        projectId,
        question: `Should “${recommendation.title}” guide the next edit pass?`.slice(0, 500),
        options: [
          {
            id: "use-recommendation",
            label: recommendation.title.slice(0, 200),
            rationale: recommendation.rationale.slice(0, 2000),
          },
          ...(result?.recommendations ?? [])
            .filter((candidate) => candidate.id !== recommendation.id)
            .slice(0, 3)
            .map((candidate, index) => ({
              id: `alternative-recommendation-${index + 1}`,
              label: candidate.title.slice(0, 200),
              rationale: candidate.rationale.slice(0, 2000),
            })),
          {
            id: "revise-recommendation",
            label: "Revise this approach",
            rationale: "Keep the underlying opportunity but change how it shapes the edit.",
          },
          {
            id: "reject-recommendation",
            label: "Do not use this approach",
            rationale: "Reject the proposal without silently turning advice into a decision.",
          },
        ],
        advisory: {
          recommendedOptionId: "use-recommendation",
          rationale: recommendation.rationale.slice(0, 2000),
          confidence: recommendation.confidence,
        },
      });
      setDecisionLinks((current) => ({ ...current, [recommendation.id]: decision.data.id }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The decision could not be created.");
    } finally {
      setPromoting(null);
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
            Find story moments
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Turn what you captured into source-backed moments and ideas to consider. Stroman shows
            what it observed separately from its creative suggestions.
          </p>
        </div>
        <Button type="button" onClick={run} disabled={busy}>
          {busy ? "Finding moments…" : result ? "Refresh findings" : "Find story moments"}
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
            <h3 className="text-sm font-semibold">What was actually captured</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Exact transcript excerpts and visible-frame evidence, kept in source order. These are
              source material, not story conclusions.
            </p>
            <FindingList
              projectId={projectId}
              outputs={result.outputs.filter((output) => output.kind === "OBSERVATION")}
              interpretation={false}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Ideas to test</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Evidence-grounded patterns and possible story connections. Confirm, revise, or reject
              them against the fuller material.
            </p>
            <FindingList
              projectId={projectId}
              outputs={result.outputs.filter((output) => output.kind !== "OBSERVATION")}
              interpretation
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Your next creative choices</h3>
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
                <EvidenceInspector
                  projectId={projectId}
                  ids={recommendation.evidenceReferenceIds}
                />
                {decisionLinks[recommendation.id] ? (
                  <a
                    href={`/projects/${projectId}/decisions/${decisionLinks[recommendation.id]}`}
                    className="text-primary mt-3 inline-flex text-sm font-medium underline-offset-4 hover:underline"
                  >
                    Review this decision
                  </a>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3"
                    disabled={promoting === recommendation.id}
                    onClick={() => void promoteRecommendation(recommendation)}
                  >
                    {promoting === recommendation.id
                      ? "Creating decision…"
                      : "Make this a decision"}
                  </Button>
                )}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
