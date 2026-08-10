"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/ui/primitives/button";

interface ImportItem {
  id: string;
  status: "PROCESSING" | "COMPLETED" | "RETRYABLE_FAILURE" | "TERMINAL_FAILURE";
  sourceName: string;
  sourceKind: "MEDIA" | "TRANSCRIPT";
  byteSize: number;
}

export function SourceIntake({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ImportItem[]>([]);
  const [busy, setBusy] = useState<"Media" | "Transcript" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/v1/projects/${projectId}/imports`, {
      credentials: "same-origin",
    });
    if (response.ok) {
      const body = (await response.json()) as { items: ImportItem[] };
      setItems(body.items);
    }
  }, [projectId]);

  useEffect(() => {
    let active = true;
    fetch(`/api/v1/projects/${projectId}/imports`, { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("status unavailable");
        return (await response.json()) as { items: ImportItem[] };
      })
      .then((body) => {
        if (active) setItems(body.items);
      })
      .catch(() => {
        if (active) setError("Import status is temporarily unavailable.");
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  async function upload(event: FormEvent<HTMLFormElement>, kind: "Media" | "Transcript") {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return;
    if (kind === "Transcript") {
      const extension = file.name.split(".").pop()?.toLowerCase();
      form.set(
        "transcriptFormat",
        extension === "srt" || extension === "vtt" || extension === "json" ? extension : "text",
      );
    }
    setBusy(kind);
    setError(null);
    const temporary: ImportItem = {
      id: `pending-${kind}`,
      status: "PROCESSING",
      sourceName: file.name,
      sourceKind: kind === "Media" ? "MEDIA" : "TRANSCRIPT",
      byteSize: file.size,
    };
    setItems((current) => [...current, temporary]);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/imports`, {
        method: "POST",
        body: form,
        headers: { "Idempotency-Key": `${projectId}:${kind}:${file.name}:${file.size}` },
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(body?.error?.message ?? "Import failed.");
      }
      formElement.reset();
      await refresh();
    } catch (caught) {
      setItems((current) => current.filter((item) => item.id !== temporary.id));
      setError(caught instanceof Error ? caught.message : "Import failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="border-border bg-card mb-8 rounded-lg border p-5" aria-labelledby="sources">
      <h2 id="sources" className="text-lg font-semibold">
        Source material
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Add media and transcripts to this project. Completed transcripts are ready for analysis.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <form onSubmit={(event) => upload(event, "Media")} className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="media-file">
            Media
          </label>
          <input id="media-file" name="file" type="file" accept="video/*,audio/*" required />
          <Button type="submit" disabled={busy !== null}>
            {busy === "Media" ? "Importing…" : "Import media"}
          </Button>
        </form>
        <form onSubmit={(event) => upload(event, "Transcript")} className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="transcript-file">
            Transcript
          </label>
          <input
            id="transcript-file"
            name="file"
            type="file"
            accept=".srt,.vtt,.json,.txt"
            required
          />
          <Button type="submit" disabled={busy !== null}>
            {busy === "Transcript" ? "Importing…" : "Import transcript"}
          </Button>
        </form>
      </div>
      {error ? (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {error}
        </p>
      ) : null}
      {items.length ? (
        <ul className="mt-5 space-y-2" aria-label="Import status">
          {items.map((item) => (
            <li
              key={item.id}
              className="border-border flex justify-between rounded border p-3 text-sm"
            >
              <span>
                <span className="font-medium">{item.sourceName}</span>
                <span className="text-muted-foreground ml-2">
                  {item.sourceKind === "MEDIA" ? "Media" : "Transcript"}
                </span>
              </span>
              <span>{item.status === "COMPLETED" ? "Complete" : "Importing…"}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
