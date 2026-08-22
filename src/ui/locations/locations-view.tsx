"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/primitives/button";
import {
  createPreparedLocation,
  errorStatus,
  friendlyError,
  listPreparedLocations,
  uploadPreparedLocationGlb,
  uploadPreparedLocationPhotos,
  startPreparedLocationReconstruction,
  type PreparedLocationItem,
} from "@/ui/auth/api-client";

const inputClass =
  "flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function statusLabel(location: PreparedLocationItem): string {
  if (location.status === "READY") return "Ready to use";
  if (location.status === "FAILED" || location.status === "NEEDS_ATTENTION")
    return "Needs attention";
  if (location.status === "PROCESSING") return "Building room";
  if (location.status === "UPLOADING") return "Adding room";
  return "Choose an input";
}

/** The calm, pre-project location entry point. Technical evidence stays inside each room. */
export function LocationsView() {
  const router = useRouter();
  const [locations, setLocations] = useState<PreparedLocationItem[] | null>(null);
  const [name, setName] = useState("");
  const [inputKind, setInputKind] = useState<"GLB" | "PHOTOS">("PHOTOS");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = () =>
      listPreparedLocations()
        .then((items) => active && setLocations(items))
        .catch((err) => {
          if (!active) return;
          if (errorStatus(err) === 401) router.replace("/login");
          else setError(friendlyError(err));
        });
    void refresh();
    // A build can finish on the Mac while this page stays open. Polling only
    // while a room is in flight removes the old reload-to-check-progress loop.
    const interval = window.setInterval(() => {
      if (locations?.some((location) => location.status === "PROCESSING")) void refresh();
    }, 5_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [locations, router]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createPreparedLocation({ name: name.trim(), inputKind });
      setLocations((current) => [created, ...(current ?? [])]);
      setName("");
    } catch (err) {
      if (errorStatus(err) === 401) router.replace("/login");
      else setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onGlb(location: PreparedLocationItem, file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await uploadPreparedLocationGlb(location.id, file);
      setLocations((current) =>
        (current ?? []).map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }
  async function onPhotos(location: PreparedLocationItem, files: File[]) {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await uploadPreparedLocationPhotos(location.id, files);
      await startPreparedLocationReconstruction(location.id);
      setLocations((current) =>
        (current ?? []).map((item) =>
          item.id === updated.id ? { ...updated, status: "PROCESSING" } : item,
        ),
      );
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="border-border bg-card flex flex-col gap-4 rounded-lg border p-5"
      aria-label="Locations"
    >
      <div>
        <h2 className="text-sm font-semibold">Locations</h2>
        <p className="text-muted-foreground text-sm">
          Prepare real spaces once, then use them when you start a story.
        </p>
      </div>
      <form onSubmit={onCreate} className="flex flex-col gap-3">
        <input
          className={inputClass}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Location name — e.g. Downtown kitchen"
          maxLength={160}
          aria-label="Location name"
        />
        <div className="flex flex-wrap gap-2" aria-label="Room input method">
          <Button
            type="button"
            variant={inputKind === "PHOTOS" ? "default" : "outline"}
            onClick={() => setInputKind("PHOTOS")}
          >
            Build from photos
          </Button>
          <Button
            type="button"
            variant={inputKind === "GLB" ? "default" : "outline"}
            onClick={() => setInputKind("GLB")}
          >
            Upload a 3D scan
          </Button>
          <Button type="submit" disabled={busy || !name.trim()}>
            {busy ? "Adding…" : "Add location"}
          </Button>
        </div>
      </form>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      {locations === null ? (
        <p className="text-muted-foreground text-sm">Loading locations…</p>
      ) : locations.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No rooms prepared yet. Add one when you are ready.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {locations.map((location) => (
            <li
              key={location.id}
              className="border-border flex items-center justify-between gap-3 rounded-md border px-3 py-3"
            >
              <span>
                <span className="block text-sm font-medium">{location.name}</span>
                <span className="text-muted-foreground text-xs">
                  {location.inputKind === "GLB" ? "3D scan" : "Photos"}
                </span>
              </span>
              {location.status === "DRAFT" && location.inputKind === "GLB" ? (
                <label className="text-sm">
                  <span className="sr-only">Upload GLB for {location.name}</span>
                  <input
                    type="file"
                    accept=".glb,model/gltf-binary"
                    disabled={busy}
                    onChange={(event) => void onGlb(location, event.target.files?.[0])}
                  />
                </label>
              ) : location.status === "DRAFT" ? (
                <label className="text-sm">
                  <span className="sr-only">Upload room photos for {location.name}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    disabled={busy}
                    onChange={(event) =>
                      void onPhotos(location, Array.from(event.target.files ?? []))
                    }
                  />
                </label>
              ) : (
                <span className="text-muted-foreground text-xs">{statusLabel(location)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
