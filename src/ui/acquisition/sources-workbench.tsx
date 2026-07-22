"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/ui/primitives/button";
import { errorStatus, friendlyError } from "@/ui/auth/api-client";
import { createSource, type KnowledgeSource, listSources } from "./acquisition-api";
import { StatusBadge } from "./status-badge";
const input = "rounded-md border px-3 py-2";
export function SourcesWorkbench() {
  const router = useRouter();
  const [items, setItems] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("MANUAL");
  const [reliability, setReliability] = useState("UNKNOWN");
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
  const refresh = useCallback(
    () =>
      listSources()
        .then(setItems)
        .catch(fail)
        .finally(() => setLoading(false)),
    [fail],
  );
  useEffect(() => {
    void refresh();
  }, [refresh]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name.trim()) {
      setError("Source name is required.");
      return;
    }
    try {
      await createSource({ name: name.trim(), sourceType: type, sourceReliability: reliability });
      setName("");
      setSuccess("Source created.");
      await refresh();
    } catch (err) {
      fail(err);
    }
  }
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Knowledge Acquisition</h1>
        <p className="text-muted-foreground text-sm">
          Review and materialize traceable knowledge from your sources.
        </p>
      </header>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <p aria-live="polite" className="text-sm">
        {success}
      </p>
      <form
        onSubmit={submit}
        className="grid gap-3 rounded-lg border p-4 md:grid-cols-4"
        aria-label="New knowledge source"
      >
        <label className="grid gap-1 text-sm">
          <span>Name</span>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Type</span>
          <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
            <option>MANUAL</option>
            <option>UPLOAD</option>
            <option>WEB_PAGE</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span>Reliability</span>
          <select
            className={input}
            value={reliability}
            onChange={(e) => setReliability(e.target.value)}
          >
            {["UNKNOWN", "LOW", "MEDIUM", "HIGH", "VERIFIED"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <div className="self-end">
          <Button type="submit">Create source</Button>
        </div>
      </form>
      <section>
        <h2 className="mb-3 font-semibold">Sources</h2>
        {loading ? (
          <p>Loading sources…</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No sources yet — create one above.</p>
        ) : (
          <ul className="grid gap-3">
            {items.map((s) => (
              <li key={s.id}>
                <Link
                  className="hover:bg-muted flex items-center justify-between rounded-lg border p-4"
                  href={`/acquisition/sources/${s.id}`}
                >
                  <span>{s.name}</span>
                  <StatusBadge status={s.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
