"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/primitives/button";
import { errorStatus, friendlyError } from "@/ui/auth/api-client";
import { attachAdvisory, type Decision, getDecision, recordHumanDecision } from "./decisions-api";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DecisionDetail({
  projectId,
  decisionId,
}: {
  projectId: string;
  decisionId: string;
}) {
  const router = useRouter();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [etag, setEtag] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const apply = useCallback((next: { data: Decision; etag: string | null }) => {
    setDecision(next.data);
    setEtag(next.etag);
  }, []);

  const handleFailure = useCallback(
    (err: unknown, setMessage: (message: string) => void) => {
      const status = errorStatus(err);
      if (status === 401) {
        router.replace("/login");
        return;
      }
      if (status === 409) {
        // Someone/something changed it; reload the authoritative state.
        void getDecision(decisionId)
          .then(apply)
          .catch(() => undefined);
        setMessage("This decision changed since you opened it — reloaded the latest.");
        return;
      }
      setMessage(friendlyError(err));
    },
    [apply, decisionId, router],
  );

  useEffect(() => {
    let active = true;
    getDecision(decisionId)
      .then((result) => {
        if (active) apply(result);
      })
      .catch((err) => {
        if (!active) return;
        if (errorStatus(err) === 401) {
          router.replace("/login");
          return;
        }
        if (errorStatus(err) === 404) {
          setNotFound(true);
          return;
        }
        setLoadError(friendlyError(err));
      });
    return () => {
      active = false;
    };
  }, [decisionId, router, apply]);

  if (notFound) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm">This decision doesn’t exist or isn’t yours.</p>
        <Link
          className="text-primary text-sm underline-offset-4 hover:underline"
          href={`/projects/${projectId}`}
        >
          Back to workspace
        </Link>
      </div>
    );
  }
  if (loadError) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {loadError}
      </p>
    );
  }
  if (!decision) {
    return <p className="text-muted-foreground text-sm">Loading decision…</p>;
  }

  const optionLabel = (id: string | null): string =>
    (id && decision.options.find((option) => option.id === id)?.label) || "—";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          className="text-muted-foreground text-xs underline-offset-4 hover:underline"
          href={`/projects/${projectId}`}
        >
          ← Workspace
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{decision.question}</h1>
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          {decision.status}
        </span>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Options</h2>
        <ul className="flex flex-col gap-2" aria-label="Options">
          {decision.options.map((option) => (
            <li key={option.id} className="border-border bg-card rounded-lg border p-3 text-sm">
              <span className="font-medium">{option.label}</span>
              {option.rationale ? (
                <span className="text-muted-foreground block">{option.rationale}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <AdvisorySection
        decision={decision}
        etag={etag}
        onApplied={apply}
        onFailure={handleFailure}
      />

      <HumanDecisionSection
        decision={decision}
        etag={etag}
        optionLabel={optionLabel}
        onApplied={apply}
        onFailure={handleFailure}
      />
    </div>
  );
}

function AdvisorySection({
  decision,
  etag,
  onApplied,
  onFailure,
}: {
  decision: Decision;
  etag: string | null;
  onApplied: (next: { data: Decision; etag: string | null }) => void;
  onFailure: (err: unknown, setMessage: (message: string) => void) => void;
}) {
  const [recommendedOptionId, setRecommendedOptionId] = useState("");
  const [rationale, setRationale] = useState("");
  const [confidencePct, setConfidencePct] = useState(70);
  const [evidence, setEvidence] = useState<
    Array<{ sourceLabel: string; observation: string; relevance: string }>
  >([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setEvidenceField(
    index: number,
    field: "sourceLabel" | "observation" | "relevance",
    value: string,
  ) {
    setEvidence((current) =>
      current.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)),
    );
  }

  async function onAttach(event: FormEvent) {
    event.preventDefault();
    if (rationale.trim() === "" || !etag) return;
    setBusy(true);
    setError(null);
    try {
      const cleanedEvidence = evidence
        .map((entry) => ({
          sourceLabel: entry.sourceLabel.trim(),
          observation: entry.observation.trim(),
          relevance: entry.relevance.trim(),
        }))
        .filter((entry) => entry.sourceLabel && entry.observation && entry.relevance);
      const next = await attachAdvisory(decision.id, etag, {
        recommendedOptionId: recommendedOptionId === "" ? null : recommendedOptionId,
        rationale: rationale.trim(),
        confidence: Math.min(1, Math.max(0, confidencePct / 100)),
        evidence: cleanedEvidence,
      });
      onApplied(next);
    } catch (err) {
      onFailure(err, setError);
    } finally {
      setBusy(false);
    }
  }

  if (decision.advisory) {
    const rec = decision.advisory.recommendedOptionId;
    const recLabel =
      (rec && decision.options.find((option) => option.id === rec)?.label) || "No single option";
    return (
      <section className="border-border bg-card flex flex-col gap-2 rounded-lg border p-4">
        <h2 className="text-sm font-semibold">AI advisory</h2>
        <p className="text-sm">
          Recommends: <span className="font-medium">{recLabel}</span> ·{" "}
          {Math.round(decision.advisory.confidence * 100)}% confidence
        </p>
        <p className="text-muted-foreground text-sm">{decision.advisory.rationale}</p>
        <div className="mt-1 flex flex-col gap-2">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Supporting evidence
          </h3>
          {decision.advisory.evidence.length === 0 ? (
            <p className="text-muted-foreground text-xs">No supporting evidence recorded.</p>
          ) : (
            <ul className="flex flex-col gap-2" aria-label="Supporting evidence">
              {decision.advisory.evidence.map((entry, index) => (
                <li key={index} className="border-border rounded-md border p-3 text-sm">
                  <span className="font-medium">{entry.sourceLabel}</span>
                  <span className="block">{entry.observation}</span>
                  <span className="text-muted-foreground block text-xs">
                    Why it matters: {entry.relevance}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    );
  }

  // No advisory yet. It may only be attached while the decision is open.
  if (decision.status !== "PROPOSED") return null;

  return (
    <form
      onSubmit={onAttach}
      aria-label="Attach AI advisory"
      className="border-border flex flex-col gap-3 rounded-lg border border-dashed p-4"
    >
      <h2 className="text-sm font-semibold">AI advisory</h2>
      <p className="text-muted-foreground text-xs">
        The advisory the AI engine will provide. Entered manually until the AI recommender is
        connected — the human decision below always stays authoritative.
      </p>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Recommended option</span>
        <select
          className={inputClass}
          value={recommendedOptionId}
          onChange={(e) => setRecommendedOptionId(e.target.value)}
          aria-label="Recommended option"
        >
          <option value="">No single option</option>
          {decision.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Rationale</span>
        <textarea
          className={inputClass}
          rows={2}
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          maxLength={2000}
          aria-label="Advisory rationale"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Confidence: {confidencePct}%</span>
        <input
          type="range"
          min={0}
          max={100}
          value={confidencePct}
          onChange={(e) => setConfidencePct(Number(e.target.value))}
          aria-label="Advisory confidence"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Supporting evidence</legend>
        <p className="text-muted-foreground text-xs">
          What information supports this recommendation?
        </p>
        {evidence.map((entry, index) => (
          <div key={index} className="border-border flex flex-col gap-2 rounded-md border p-3">
            <input
              className={inputClass}
              value={entry.sourceLabel}
              onChange={(e) => setEvidenceField(index, "sourceLabel", e.target.value)}
              placeholder="Source (e.g. Client brief)"
              maxLength={200}
              aria-label={`Evidence ${index + 1} source`}
            />
            <textarea
              className={inputClass}
              rows={2}
              value={entry.observation}
              onChange={(e) => setEvidenceField(index, "observation", e.target.value)}
              placeholder="Observation or excerpt"
              maxLength={2000}
              aria-label={`Evidence ${index + 1} observation`}
            />
            <input
              className={inputClass}
              value={entry.relevance}
              onChange={(e) => setEvidenceField(index, "relevance", e.target.value)}
              placeholder="Why it's relevant"
              maxLength={2000}
              aria-label={`Evidence ${index + 1} relevance`}
            />
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEvidence((current) => current.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={evidence.length >= 20}
            onClick={() =>
              setEvidence((current) => [
                ...current,
                { sourceLabel: "", observation: "", relevance: "" },
              ])
            }
          >
            Add evidence
          </Button>
        </div>
      </fieldset>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <div>
        <Button type="submit" variant="secondary" disabled={busy || rationale.trim() === ""}>
          {busy ? "Attaching…" : "Attach advisory"}
        </Button>
      </div>
    </form>
  );
}

function HumanDecisionSection({
  decision,
  etag,
  optionLabel,
  onApplied,
  onFailure,
}: {
  decision: Decision;
  etag: string | null;
  optionLabel: (id: string | null) => string;
  onApplied: (next: { data: Decision; etag: string | null }) => void;
  onFailure: (err: unknown, setMessage: (message: string) => void) => void;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [rationale, setRationale] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDecide(event: FormEvent) {
    event.preventDefault();
    if (selectedOptionId === "" || rationale.trim() === "" || !etag) return;
    setBusy(true);
    setError(null);
    try {
      const next = await recordHumanDecision(decision.id, etag, {
        selectedOptionId,
        rationale: rationale.trim(),
      });
      onApplied(next);
    } catch (err) {
      onFailure(err, setError);
    } finally {
      setBusy(false);
    }
  }

  if (decision.status === "DECIDED") {
    const advisedId = decision.advisory?.recommendedOptionId ?? null;
    const followed = advisedId !== null && advisedId === decision.selectedOptionId;
    return (
      <section className="border-border bg-card flex flex-col gap-1 rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Human decision</h2>
        <p className="text-sm">
          Chose: <span className="font-medium">{optionLabel(decision.selectedOptionId)}</span>
        </p>
        {decision.decisionRationale ? (
          <p className="text-muted-foreground text-sm">{decision.decisionRationale}</p>
        ) : null}
        {decision.advisory ? (
          <p className="text-muted-foreground text-xs">
            {followed ? "Followed the AI recommendation." : "Overrode the AI recommendation."}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <form
      onSubmit={onDecide}
      aria-label="Record decision"
      className="border-border flex flex-col gap-3 rounded-lg border p-4"
    >
      <h2 className="text-sm font-semibold">Your decision</h2>
      {decision.advisory?.recommendedOptionId ? (
        <p className="text-muted-foreground text-xs">
          AI recommends {optionLabel(decision.advisory.recommendedOptionId)} — you decide.
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Chosen option</span>
        <select
          className={inputClass}
          value={selectedOptionId}
          onChange={(e) => setSelectedOptionId(e.target.value)}
          aria-label="Chosen option"
        >
          <option value="">Select an option…</option>
          {decision.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Why</span>
        <textarea
          className={inputClass}
          rows={2}
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          maxLength={2000}
          aria-label="Decision rationale"
        />
      </label>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={busy || selectedOptionId === "" || rationale.trim() === ""}>
          {busy ? "Recording…" : "Record decision"}
        </Button>
      </div>
    </form>
  );
}
