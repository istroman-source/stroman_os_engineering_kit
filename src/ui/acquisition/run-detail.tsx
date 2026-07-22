"use client";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/ui/primitives/button";
import { errorStatus, friendlyError } from "@/ui/auth/api-client";
import * as api from "./acquisition-api";
import { PayloadView } from "./payload-view";
import { PayloadEditor } from "./payload-editor";
import { ResolutionForm } from "./resolution-form";
import { StatusBadge } from "./status-badge";
export function RunDetail({ runId }: { runId: string }) {
  const router = useRouter();
  const [run, setRun] = useState<api.AcquisitionRun | null>(null);
  const [runEtag, setRunEtag] = useState<string | null>(null);
  const [items, setItems] = useState<api.KnowledgeObservation[]>([]);
  const [selected, setSelected] = useState<api.ObservationWithReview | null>(null);
  const [obsEtag, setObsEtag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [outcome, setOutcome] = useState("ACCEPT");
  const [note, setNote] = useState("");
  const [edited, setEdited] = useState<api.ObservationPayload | null>(null);
  const [result, setResult] = useState<api.MaterializationResult | null>(null);
  const [completeStatus, setCompleteStatus] = useState("SUCCEEDED");
  const [counts, setCounts] = useState({
    documentsProcessed: "0",
    observationsCreated: "0",
    failureCount: "0",
  });
  const fail = useCallback(
    (e: unknown) => {
      if (errorStatus(e) === 401) {
        router.replace("/login");
        return;
      }
      setError(friendlyError(e));
    },
    [router],
  );
  const refresh = useCallback(async () => {
    try {
      const [r, o] = await Promise.all([api.getRun(runId), api.listObservationsByRun(runId)]);
      setRun(r.data);
      setRunEtag(r.etag);
      setItems(o);
    } catch (e) {
      fail(e);
    } finally {
      setLoading(false);
    }
  }, [runId, fail]);
  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);
  async function select(id: string) {
    setOutcome("ACCEPT");
    setNote("");
    setEdited(null);
    setSuccess(null);
    try {
      const r = await api.getObservation(id);
      setSelected(r.data);
      setObsEtag(r.etag);
      setEdited(r.data.observation.payload);
      setResult(null);
    } catch (e) {
      fail(e);
    }
  }
  async function runAction(action: "start" | "fail") {
    if (!runEtag) return;
    setError(null);
    setSuccess(null);
    try {
      const r =
        action === "start" ? await api.startRun(runId, runEtag) : await api.failRun(runId, runEtag);
      setRun(r.data);
      setRunEtag(r.etag);
      setSuccess(`Run ${action}ed.`);
    } catch (e) {
      if (errorStatus(e) === 409) {
        setError("This run changed since you loaded it — refreshed with the latest version.");
        await refresh();
      } else fail(e);
    }
  }
  async function complete(e: FormEvent) {
    e.preventDefault();
    if (!runEtag) return;
    setError(null);
    setSuccess(null);
    const summary = Object.fromEntries(
      Object.entries(counts).map(([k, v]) => [k, Number(v)]),
    ) as unknown as api.RunSummary;
    if (Object.values(summary).some((v) => !Number.isInteger(v) || v < 0)) {
      setError("Completion counts must be non-negative integers.");
      return;
    }
    try {
      const r = await api.completeRun(runId, { status: completeStatus, summary }, runEtag);
      setRun(r.data);
      setRunEtag(r.etag);
      setSuccess("Run completed.");
    } catch (x) {
      if (errorStatus(x) === 409) {
        setError("This run changed since you loaded it — refreshed with the latest version.");
        await refresh();
      } else fail(x);
    }
  }
  async function review(e: FormEvent) {
    e.preventDefault();
    if (!selected || !obsEtag) return;
    setError(null);
    setSuccess(null);
    try {
      const body: {
        outcome: string;
        note?: string | null;
        editedPayload?: api.ObservationPayload;
      } = { outcome, note: note.trim() || null };
      if (outcome === "EDIT_AND_ACCEPT" && edited) body.editedPayload = edited;
      const r = await api.reviewObservation(selected.observation.id, body, obsEtag);
      setSelected(r.data);
      setObsEtag(r.etag);
      setSuccess("Observation reviewed.");
      await refresh();
    } catch (x) {
      if (errorStatus(x) === 409) {
        setError(
          "This observation changed since you loaded it — refreshed with the latest version.",
        );
        await select(selected.observation.id);
      } else fail(x);
    }
  }
  async function materialize(resolution: Record<string, unknown>) {
    if (!selected) return;
    setError(null);
    setSuccess(null);
    try {
      const r = await api.materializeObservation(selected.observation.id, resolution);
      setResult(r.data);
      setSuccess("Observation materialized.");
    } catch (e) {
      fail(e);
    }
  }
  if (loading) return <p>Loading run…</p>;
  return (
    <div className="grid gap-6">
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <p aria-live="polite">{success}</p>
      {run && (
        <header className="grid gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Acquisition run</h1>
            <StatusBadge status={run.status} />
          </div>
          {run.status === "PENDING" && (
            <div className="flex gap-2">
              <Button onClick={() => runAction("start")}>Start</Button>
              <Button variant="outline" onClick={() => runAction("fail")}>
                Fail
              </Button>
            </div>
          )}
          {run.status === "RUNNING" && (
            <form onSubmit={complete} className="grid gap-2 rounded-lg border p-3 md:grid-cols-5">
              <label>
                Outcome
                <select
                  className="block rounded border p-2"
                  value={completeStatus}
                  onChange={(e) => setCompleteStatus(e.target.value)}
                >
                  <option>SUCCEEDED</option>
                  <option>PARTIALLY_SUCCEEDED</option>
                  <option>FAILED</option>
                </select>
              </label>
              {Object.keys(counts).map((k) => (
                <label key={k}>
                  {k}
                  <input
                    type="number"
                    min="0"
                    className="block w-full rounded border p-2"
                    value={counts[k as keyof typeof counts]}
                    onChange={(e) => setCounts({ ...counts, [k]: e.target.value })}
                  />
                </label>
              ))}
              <div className="flex items-end gap-2">
                <Button type="submit">Complete</Button>
                <Button type="button" variant="outline" onClick={() => runAction("fail")}>
                  Fail
                </Button>
              </div>
            </form>
          )}
        </header>
      )}
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <section className="rounded-lg border p-4">
          <h2 className="mb-3 font-semibold">Observations</h2>
          {items.length ? (
            <ul className="grid gap-2">
              {items.map((o) => (
                <li key={o.id}>
                  <button
                    className="flex w-full justify-between rounded border p-3 text-left"
                    onClick={() => select(o.id)}
                  >
                    <span>{o.observationType}</span>
                    <StatusBadge status={o.status} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No observations for this run.</p>
          )}
        </section>
        <section className="grid gap-4 rounded-lg border p-4">
          <h2 className="font-semibold">Observation inspector</h2>
          {!selected ? (
            <p>Select an observation.</p>
          ) : (
            <>
              <div className="flex gap-2">
                <StatusBadge status={selected.observation.status} />
                <span>{selected.observation.createdBy}</span>
                <span>Confidence: {selected.observation.confidence ?? "—"}</span>
              </div>
              <PayloadView payload={selected.observation.payload} />
              <details>
                <summary>Evidence</summary>
                <pre className="overflow-auto text-xs">
                  {JSON.stringify(selected.observation.evidence, null, 2)}
                </pre>
              </details>
              <p>Review: {selected.review?.outcome ?? "Not reviewed"}</p>
              {selected.observation.status === "PENDING_REVIEW" && (
                <form className="grid gap-3" onSubmit={review}>
                  <label>
                    Outcome
                    <select
                      className="ml-2 rounded border p-2"
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                    >
                      <option value="ACCEPT">Accept</option>
                      <option value="REJECT">Reject</option>
                      <option value="EDIT_AND_ACCEPT">Edit and accept</option>
                    </select>
                  </label>
                  {outcome === "EDIT_AND_ACCEPT" && edited && (
                    <PayloadEditor value={edited} onChange={setEdited} />
                  )}
                  <label>
                    Note
                    <textarea
                      className="block w-full rounded border p-2"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </label>
                  <Button type="submit">Submit review</Button>
                </form>
              )}
              {selected.observation.status === "ACCEPTED" && (
                <ResolutionForm
                  kind={selected.observation.observationType}
                  onSubmit={materialize}
                />
              )}{" "}
              {result && (
                <div className="rounded border p-3" aria-live="polite">
                  <strong>{result.record.recordType}</strong>
                  <p className="font-mono text-sm">{result.record.recordId}</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
