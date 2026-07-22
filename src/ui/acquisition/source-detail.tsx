"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/ui/primitives/button";
import { errorStatus, friendlyError } from "@/ui/auth/api-client";
import * as api from "./acquisition-api";
import { StatusBadge } from "./status-badge";
const input = "rounded-md border px-3 py-2";
export function SourceDetail({ sourceId }: { sourceId: string }) {
  const router = useRouter();
  const [source, setSource] = useState<api.KnowledgeSource | null>(null);
  const [etag, setEtag] = useState<string | null>(null);
  const [docs, setDocs] = useState<api.SourceDocument[]>([]);
  const [runs, setRuns] = useState<api.AcquisitionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [hash, setHash] = useState("");
  const [docType, setDocType] = useState("NOTE");
  const [extractor, setExtractor] = useState("");
  const [version, setVersion] = useState("");
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
      const [s, d, r] = await Promise.all([
        api.getSource(sourceId),
        api.listDocuments(sourceId),
        api.listRuns(sourceId),
      ]);
      setSource(s.data);
      setEtag(s.etag);
      setDocs(d);
      setRuns(r);
    } catch (e) {
      fail(e);
    } finally {
      setLoading(false);
    }
  }, [sourceId, fail]);
  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);
  async function transition(action: "pause" | "resume" | "archive") {
    if (!etag) return;
    setError(null);
    try {
      const fn =
        action === "pause"
          ? api.pauseSource
          : action === "resume"
            ? api.resumeSource
            : api.archiveSource;
      const r = await fn(sourceId, etag);
      setSource(r.data);
      setEtag(r.etag);
      setSuccess(`Source ${action}d.`);
    } catch (e) {
      if (errorStatus(e) === 409) {
        setError("This source changed since you loaded it — refreshed with the latest version.");
        await refresh();
      } else fail(e);
    }
  }
  async function addDoc(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !hash.trim()) {
      setError("Document title and content hash are required.");
      return;
    }
    try {
      await api.addDocument(sourceId, {
        documentType: docType,
        title: title.trim(),
        contentHash: hash.trim(),
      });
      setTitle("");
      setHash("");
      setSuccess("Document added.");
      await refresh();
    } catch (x) {
      fail(x);
    }
  }
  async function addRun(e: FormEvent) {
    e.preventDefault();
    if (!extractor.trim() || !version.trim()) {
      setError("Extractor and version are required.");
      return;
    }
    try {
      await api.createRun(sourceId, {
        extractor: extractor.trim(),
        extractorVersion: version.trim(),
      });
      setExtractor("");
      setVersion("");
      setSuccess("Run created.");
      await refresh();
    } catch (x) {
      fail(x);
    }
  }
  if (loading) return <p>Loading source…</p>;
  return (
    <div className="grid gap-6">
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <p aria-live="polite">{success}</p>
      {source && (
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{source.name}</h1>
            <StatusBadge status={source.status} />
          </div>
          <div className="flex gap-2">
            {source.status === "ACTIVE" && (
              <Button onClick={() => transition("pause")}>Pause</Button>
            )}
            {source.status === "PAUSED" && (
              <Button onClick={() => transition("resume")}>Resume</Button>
            )}
            {source.status !== "ARCHIVED" && (
              <Button variant="outline" onClick={() => transition("archive")}>
                Archive
              </Button>
            )}
          </div>
        </header>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="grid gap-3 rounded-lg border p-4">
          <h2 className="font-semibold">Documents</h2>
          <form className="grid gap-2" onSubmit={addDoc}>
            <label>
              Title
              <input
                className={`${input} w-full`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              Content hash
              <input
                className={`${input} w-full`}
                value={hash}
                onChange={(e) => setHash(e.target.value)}
              />
            </label>
            <label>
              Type
              <select
                className={`${input} w-full`}
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                {["NOTE", "TRANSCRIPT", "ARTICLE", "WEB_PAGE", "SOCIAL_POST", "PDF", "VIDEO"].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </label>
            <Button type="submit">Add document</Button>
          </form>
          {docs.length ? (
            <ul>
              {docs.map((d) => (
                <li className="border-t py-2" key={d.id}>
                  {d.title} · {d.documentType}
                </li>
              ))}
            </ul>
          ) : (
            <p>No documents yet.</p>
          )}
        </section>
        <section className="grid gap-3 rounded-lg border p-4">
          <h2 className="font-semibold">Runs</h2>
          <form className="grid gap-2" onSubmit={addRun}>
            <label>
              Extractor
              <input
                className={`${input} w-full`}
                value={extractor}
                onChange={(e) => setExtractor(e.target.value)}
              />
            </label>
            <label>
              Version
              <input
                className={`${input} w-full`}
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </label>
            <Button type="submit">Create run</Button>
          </form>
          {runs.length ? (
            <ul>
              {runs.map((r) => (
                <li className="border-t py-2" key={r.id}>
                  <Link className="flex justify-between" href={`/acquisition/runs/${r.id}`}>
                    <span>
                      {r.extractor} {r.extractorVersion}
                    </span>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No runs yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
