"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGetWithEtag, errorStatus, friendlyError } from "@/ui/auth/api-client";
import type { Decision } from "@/ui/decisions/decisions-api";
import { Button } from "@/ui/primitives/button";

export interface ProjectReviewData {
  readonly project: { readonly id: string; readonly name: string; readonly status: string };
  readonly readiness: "EMPTY" | "NEEDS_ATTENTION" | "READY";
  readonly intent: null | {
    readonly title: string;
    readonly creativeGoal: string;
    readonly targetAudience: string;
    readonly desiredEmotion: string;
    readonly currentDirection: string | null;
    readonly version: number;
    readonly updatedAt: string;
  };
  readonly sources: {
    readonly total: number;
    readonly completed: number;
    readonly needsAttention: number;
    readonly kinds: readonly string[];
  };
  readonly evidence: ReadonlyArray<{
    readonly id: string;
    readonly sourceKind: "LEGACY" | "TRANSCRIPT" | "VISUAL_MEDIA";
    readonly kind: string;
    readonly content: string;
    readonly confidence: number | null;
    readonly evidenceReferenceIds: readonly string[];
  }>;
  readonly recommendations: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly rationale: string;
    readonly confidence: number;
    readonly evidenceReferenceIds: readonly string[];
    readonly decisionId: string | null;
  }>;
  readonly decisions: readonly Decision[];
  readonly decisionSummary: {
    readonly accepted: number;
    readonly rejected: number;
    readonly deferred: number;
    readonly unresolved: number;
  };
  readonly conflicts: readonly string[];
  readonly missingCoverage: readonly string[];
  readonly unresolvedActions: readonly string[];
}

function confidence(value: number | null): string {
  return value === null ? "Unscored" : `${Math.round(value * 100)}% confidence`;
}

function sourceLabel(source: ProjectReviewData["evidence"][number]["sourceKind"]): string {
  if (source === "TRANSCRIPT") return "Transcript";
  if (source === "VISUAL_MEDIA") return "Picture";
  return "Earlier analysis";
}

function selectedLabel(decision: Decision): string {
  if (decision.status !== "DECIDED") return "Still choosing";
  return (
    decision.options.find((option) => option.id === decision.selectedOptionId)?.label ??
    "Decision recorded"
  );
}

export function ProjectReview({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [review, setReview] = useState<ProjectReviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    apiGetWithEtag<ProjectReviewData>(`/api/v1/projects/${encodeURIComponent(projectId)}/review`)
      .then(({ data }) => {
        if (!active) return;
        setReview(data);
        setError(null);
      })
      .catch((caught) => {
        if (!active) return;
        if (errorStatus(caught) === 401) router.replace("/login");
        else setError(friendlyError(caught));
      });
    return () => {
      active = false;
    };
  }, [attempt, projectId, router]);

  if (error) {
    return (
      <div className="border-border bg-card rounded-xl border p-5" role="alert">
        <p className="text-destructive text-sm">{error}</p>
        <Button className="mt-3" variant="outline" onClick={() => setAttempt((value) => value + 1)}>
          Reload review
        </Button>
      </div>
    );
  }
  if (!review) return <p className="text-muted-foreground text-sm">Preparing project review…</p>;

  const facts = review.evidence.filter((item) => item.kind === "OBSERVATION");
  const interpretations = review.evidence.filter((item) => item.kind !== "OBSERVATION");
  const base = `/projects/${projectId}`;

  if (review.readiness === "EMPTY") {
    return (
      <section className="border-border bg-card rounded-2xl border p-6 sm:p-8">
        <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Project review
        </p>
        <h2 className="mt-2 text-2xl font-semibold">There is nothing to review yet</h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
          Start with what the film should do. Review will assemble the current intent, source proof,
          recommendations, and your choices as the project develops.
        </p>
        <Link
          href={base}
          className="bg-primary text-primary-foreground mt-5 inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium"
        >
          Develop the idea
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Project review
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">What the film currently is</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            Intent, source proof, recommendations, and filmmaker choices in one handoff view.
          </p>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
            review.readiness === "READY"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
          }`}
        >
          {review.readiness === "READY" ? "Ready to hand off" : "Needs a final pass"}
        </span>
      </header>

      <section className="border-border bg-card rounded-2xl border p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Current intent
            </p>
            <h3 className="mt-2 text-xl font-semibold">{review.intent?.title ?? "Intent is open"}</h3>
          </div>
          <Link className="text-primary text-sm underline-offset-4 hover:underline" href={base}>
            Revise the idea
          </Link>
        </div>
        <dl className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-muted-foreground text-xs uppercase">What it should do</dt>
            <dd className="mt-1 text-sm leading-relaxed">
              {review.intent?.creativeGoal || "Still to be decided."}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase">Current direction</dt>
            <dd className="mt-1 text-sm leading-relaxed">
              {review.intent?.currentDirection || "No direction has been proposed yet."}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase">Audience</dt>
            <dd className="mt-1 text-sm">{review.intent?.targetAudience || "Still open."}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase">Intended feeling</dt>
            <dd className="mt-1 text-sm">{review.intent?.desiredEmotion || "Still open."}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">What the material supports</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {review.sources.completed} of {review.sources.total} sources are usable.
            </p>
          </div>
          <Link className="text-primary text-sm underline-offset-4 hover:underline" href={`${base}/materials`}>
            Inspect footage & notes
          </Link>
        </div>
        {facts.length === 0 ? (
          <div className="border-border bg-card rounded-xl border p-5 text-sm">
            No source-backed observations are ready yet.
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2" aria-label="Source-backed observations">
            {facts.map((item) => (
              <li key={item.id} className="border-border bg-card rounded-xl border p-4">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {sourceLabel(item.sourceKind)} fact · {confidence(item.confidence)}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{item.content}</p>
                {item.evidenceReferenceIds.length > 0 ? (
                  <p className="text-muted-foreground mt-3 text-xs">
                    {item.evidenceReferenceIds.length} inspectable source reference
                    {item.evidenceReferenceIds.length === 1 ? "" : "s"}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {interpretations.length > 0 ? (
          <details className="border-border bg-card rounded-xl border px-4 py-3">
            <summary className="min-h-11 cursor-pointer content-center text-sm font-medium">
              See editorial interpretations ({interpretations.length})
            </summary>
            <ul className="mt-3 space-y-3 border-t pt-3" aria-label="Editorial interpretations">
              {interpretations.map((item) => (
                <li key={item.id}>
                  <p className="text-muted-foreground text-xs uppercase">
                    Interpretation · {confidence(item.confidence)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{item.content}</p>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Recommendations and choices</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {review.decisionSummary.accepted} kept · {review.decisionSummary.rejected} rejected ·{" "}
              {review.decisionSummary.deferred} deferred · {review.decisionSummary.unresolved} open
            </p>
          </div>
          <Link className="text-primary text-sm underline-offset-4 hover:underline" href={`${base}/decisions`}>
            Work through choices
          </Link>
        </div>
        {review.decisions.length === 0 ? (
          <div className="border-border bg-card rounded-xl border p-5 text-sm">
            No consequential choices have been recorded yet.
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Project choices">
            {review.decisions.map((decision) => (
              <li key={decision.id}>
                <Link
                  href={`${base}/decisions/${decision.id}`}
                  className="border-border bg-card hover:border-primary/50 block rounded-xl border p-4"
                >
                  <span className="text-sm font-medium">{decision.question}</span>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {selectedLabel(decision)}
                    {decision.context?.needsReview ? " · Revisit after an upstream change" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {review.conflicts.length > 0 || review.missingCoverage.length > 0 || review.unresolvedActions.length > 0 ? (
        <section className="border-border bg-card rounded-2xl border p-5 sm:p-6">
          <h3 className="text-lg font-semibold">Before handoff</h3>
          {review.conflicts.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium">Choices worth revisiting</h4>
              <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
                {review.conflicts.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ) : null}
          {review.missingCoverage.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium">Missing coverage</h4>
              <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
                {review.missingCoverage.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ) : null}
          {review.unresolvedActions.length > 0 ? (
            <details className="mt-4">
              <summary className="min-h-11 cursor-pointer content-center text-sm font-medium">
                Open actions ({review.unresolvedActions.length})
              </summary>
              <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
                {review.unresolvedActions.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </details>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
