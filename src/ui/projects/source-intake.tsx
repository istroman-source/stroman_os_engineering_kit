"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/ui/primitives/button";
import { extractVideoFrames } from "./video-frame-extractor";

interface ImportItem {
  id: string;
  status: "UPLOADING" | "PROCESSING" | "COMPLETED" | "RETRYABLE_FAILURE" | "TERMINAL_FAILURE";
  sourceName: string;
  sourceKind: "MEDIA" | "TRANSCRIPT" | "DOCUMENT" | "REFERENCE_IMAGE";
  byteSize: number;
  failureCode?: string | null;
}

const STATUS_COPY: Record<ImportItem["status"], { label: string; detail: string }> = {
  UPLOADING: { label: "Uploading", detail: "Keeping the original source safe." },
  PROCESSING: { label: "Processing", detail: "Preparing this source for analysis." },
  COMPLETED: { label: "Ready", detail: "Available for analysis and evidence review." },
  RETRYABLE_FAILURE: {
    label: "Needs retry",
    detail: "The original is preserved. Retry without uploading it again.",
  },
  TERMINAL_FAILURE: {
    label: "Needs replacement",
    detail: "This file could not be read safely. Choose a corrected replacement.",
  },
};

export function SourceIntake({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ImportItem[]>([]);
  const [busy, setBusy] = useState<"Media" | "Transcript" | "Context" | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<string | null>(null);
  const [mediaInsight, setMediaInsight] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/v1/projects/${projectId}/imports`, {
      credentials: "same-origin",
    });
    if (!response.ok) throw new Error("Import status is temporarily unavailable.");
    const body = (await response.json()) as { items: ImportItem[] };
    setItems(body.items);
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

  useEffect(() => {
    if (!items.some((item) => item.status === "PROCESSING")) return;
    const timer = window.setInterval(() => void refresh().catch(() => undefined), 2_000);
    return () => window.clearInterval(timer);
  }, [items, refresh]);

  async function retry(item: ImportItem) {
    setRetryingId(item.id);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/projects/${projectId}/imports/${encodeURIComponent(item.id)}/retry`,
        { method: "POST", credentials: "same-origin" },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(body?.error?.message ?? "Retry could not start.");
      }
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Retry could not start.");
    } finally {
      setRetryingId(null);
    }
  }

  async function upload(
    event: FormEvent<HTMLFormElement>,
    kind: "Media" | "Transcript" | "Context",
  ) {
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
    if (kind === "Context") {
      form.set("sourceKind", file.type.startsWith("image/") ? "REFERENCE_IMAGE" : "DOCUMENT");
    }
    setBusy(kind);
    setError(null);
    setMediaInsight(null);
    const temporary: ImportItem = {
      id: `pending-${kind}`,
      status: "UPLOADING",
      sourceName: file.name,
      sourceKind:
        kind === "Transcript"
          ? "TRANSCRIPT"
          : kind === "Context" && file.type.startsWith("image/")
            ? "REFERENCE_IMAGE"
            : kind === "Context"
              ? "DOCUMENT"
              : "MEDIA",
      byteSize: file.size,
    };
    setItems((current) => [...current, temporary]);
    try {
      const frames =
        kind === "Media" && file.type.startsWith("video/") ? await extractVideoFrames(file) : [];
      setActivity(frames.length ? "Importing media…" : null);
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
      const receipt = (await response.json()) as { mediaId?: string | null };
      await refresh();
      if (frames.length) {
        if (!receipt.mediaId)
          throw new Error("Media imported, but its evidence record is missing.");
        setActivity("Reading visible material from sampled frames…");
        const visualForm = new FormData();
        visualForm.set("mediaId", receipt.mediaId);
        visualForm.set(
          "frameMetadata",
          JSON.stringify(
            frames.map((frame) => ({ index: frame.index, timestampMs: frame.timestampMs })),
          ),
        );
        for (const frame of frames) {
          visualForm.append("frame", frame.blob, `frame-${frame.index}.jpg`);
        }
        const visualResponse = await fetch(`/api/v1/projects/${projectId}/media-visual-analysis`, {
          method: "POST",
          body: visualForm,
          credentials: "same-origin",
        });
        if (!visualResponse.ok) {
          const body = (await visualResponse.json().catch(() => null)) as {
            error?: { message?: string };
          } | null;
          throw new Error(
            body?.error?.message ?? "Media imported, but visual analysis could not be completed.",
          );
        }
        setMediaInsight(
          "Visible material analyzed from representative frames and linked to the imported video.",
        );
        window.dispatchEvent(new Event("stroman:analysis-completed"));
      }
      formElement.reset();
    } catch (caught) {
      setItems((current) => current.filter((item) => item.id !== temporary.id));
      await refresh().catch(() => undefined);
      setError(caught instanceof Error ? caught.message : "Import failed.");
    } finally {
      setBusy(null);
      setActivity(null);
    }
  }

  return (
    <section className="border-border bg-card mb-8 rounded-lg border p-5" aria-labelledby="sources">
      <h2 id="sources" className="text-lg font-semibold">
        Add what you captured
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Start with a video, audio recording, or transcript. Stroman keeps the original material and
        helps you find the moments worth using.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <form onSubmit={(event) => upload(event, "Media")} className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="media-file">
            Video or audio
          </label>
          <input
            id="media-file"
            className="max-w-full text-sm"
            name="file"
            type="file"
            accept="video/*,audio/*"
            required
          />
          <Button type="submit" disabled={busy !== null}>
            {busy === "Media" ? (activity ?? "Preparing media…") : "Add video or audio"}
          </Button>
        </form>
        <form onSubmit={(event) => upload(event, "Transcript")} className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="transcript-file">
            Transcript or script
          </label>
          <input
            id="transcript-file"
            className="max-w-full text-sm"
            name="file"
            type="file"
            accept=".srt,.vtt,.json,.txt"
            required
          />
          <Button type="submit" disabled={busy !== null}>
            {busy === "Transcript" ? "Adding…" : "Add transcript"}
          </Button>
        </form>
        <form onSubmit={(event) => upload(event, "Context")} className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="context-file">
            Brief, notes, or reference image
          </label>
          <input
            id="context-file"
            className="max-w-full text-sm"
            name="file"
            type="file"
            accept=".txt,.md,.pdf,.doc,.docx,image/*"
            required
          />
          <Button type="submit" disabled={busy !== null}>
            {busy === "Context" ? "Adding context…" : "Add project context"}
          </Button>
        </form>
      </div>
      {error ? (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {error}
        </p>
      ) : null}
      {mediaInsight ? (
        <p role="status" className="text-muted-foreground mt-3 text-sm">
          {mediaInsight}
        </p>
      ) : null}
      {items.length ? (
        <ul className="mt-5 space-y-2" aria-label="Import status">
          {items.map((item) => {
            const status = STATUS_COPY[item.status];
            return (
              <li key={item.id} className="border-border rounded border p-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span>
                    <span className="font-medium">{item.sourceName}</span>
                    <span className="text-muted-foreground ml-2">
                      {item.sourceKind === "MEDIA"
                        ? "Media"
                        : item.sourceKind === "TRANSCRIPT"
                          ? "Transcript"
                          : item.sourceKind === "REFERENCE_IMAGE"
                            ? "Reference image"
                            : "Document"}
                    </span>
                  </span>
                  <span className="font-medium">{status.label}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">{status.detail}</span>
                  {item.status === "RETRYABLE_FAILURE" ? (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={retryingId !== null || busy !== null}
                      onClick={() => void retry(item)}
                    >
                      {retryingId === item.id ? "Retrying…" : "Retry preserved source"}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
