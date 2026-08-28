"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Pencil, RotateCcw, Upload } from "lucide-react";
import {
  createPreparedLocation,
  errorStatus,
  friendlyError,
  getPreparedLocation,
  renamePreparedLocation,
  startPreparedLocationReconstruction,
  uploadPreparedLocationGlb,
  uploadPreparedLocationPhotos,
  type PreparedLocationDetail,
} from "@/ui/auth/api-client";
import { Button } from "@/ui/primitives/button";
import { preparedLocationStatus } from "./locations-view";
import { PreparedRoomViewer } from "./prepared-room-viewer";

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LocationDetailView({
  locationId,
  returnTo,
}: {
  locationId: string;
  returnTo?: string;
}) {
  const router = useRouter();
  const [location, setLocation] = useState<PreparedLocationDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await getPreparedLocation(locationId);
      setLocation(next);
      if (!editingName) setName(next.name);
    } catch (err) {
      if (errorStatus(err) === 401) router.replace("/login");
      else setError(friendlyError(err));
    }
  }, [editingName, locationId, router]);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(initial);
  }, [refresh]);

  useEffect(() => {
    if (location?.status !== "PROCESSING" && location?.status !== "UPLOADING") return;
    const interval = window.setInterval(() => void refresh(), 5_000);
    return () => window.clearInterval(interval);
  }, [location?.status, refresh]);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await refresh();
    } catch (err) {
      if (errorStatus(err) === 401) router.replace("/login");
      else {
        setError(friendlyError(err));
        void refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function onRename(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    await run(async () => {
      const updated = await renamePreparedLocation(locationId, name.trim());
      setLocation(updated);
      setEditingName(false);
    });
  }

  async function prepareNewVersion() {
    await run(async () => {
      const replacement = await createPreparedLocation({
        name: `${location!.name} — new version`,
        inputKind: location!.inputKind,
      });
      router.push(`/locations/${encodeURIComponent(replacement.id)}`);
    });
  }

  if (!location)
    return (
      <div className="space-y-6">
        <Link
          href={returnTo ?? "/locations"}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="size-4" /> {returnTo ? "Back to storyboard" : "Locations"}
        </Link>
        <p role="status" className="text-muted-foreground py-12 text-sm">
          Opening location…
        </p>
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
      </div>
    );

  const status = preparedLocationStatus(location);
  const inFlight = location.status === "PROCESSING" || location.status === "UPLOADING";

  return (
    <div className="space-y-8">
      <Link
        href={returnTo ?? "/locations"}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" /> {returnTo ? "Back to storyboard" : "All locations"}
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {editingName ? (
            <form onSubmit={onRename} className="flex max-w-lg items-center gap-2">
              <label className="sr-only" htmlFor="location-name">
                Location name
              </label>
              <input
                id="location-name"
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={160}
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                disabled={busy || !name.trim()}
                aria-label="Save location name"
              >
                <Check />
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="truncate text-3xl font-semibold tracking-tight">{location.name}</h1>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditingName(true)}
                aria-label="Rename location"
              >
                <Pencil />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground mt-2 text-sm">{status.detail}</p>
        </div>
        <span className={`self-start rounded-full px-3 py-1.5 text-sm font-medium ${status.tone}`}>
          {status.label}
        </span>
      </header>

      {error ? (
        <p
          role="alert"
          className="text-destructive rounded-lg border border-current/20 p-3 text-sm"
        >
          {error}
        </p>
      ) : null}

      {location.status === "READY" && location.environment ? (
        <PreparedRoomViewer
          locationId={location.id}
          locationName={location.name}
          environment={location.environment}
        />
      ) : location.status === "DRAFT" ? (
        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Add the room</h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm">
            {location.inputKind === "PHOTOS"
              ? "Choose 20–40 overlapping JPEG or PNG photos. Walk around the room and keep each view connected to the next."
              : "Choose one textured GLB room scan, up to 100 MB."}
          </p>
          <label className="bg-primary text-primary-foreground hover:bg-primary/90 mt-5 inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm">
            <Upload className="size-4" />
            {location.inputKind === "PHOTOS" ? "Choose room photos" : "Choose 3D scan"}
            <input
              className="sr-only"
              type="file"
              accept={
                location.inputKind === "PHOTOS" ? "image/jpeg,image/png" : ".glb,model/gltf-binary"
              }
              multiple={location.inputKind === "PHOTOS"}
              disabled={busy}
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (!files.length) return;
                if (location.inputKind === "PHOTOS" && (files.length < 20 || files.length > 40)) {
                  setError("Choose 20 to 40 overlapping JPEG or PNG photos.");
                  event.currentTarget.value = "";
                  return;
                }
                void run(async () => {
                  if (location.inputKind === "PHOTOS") {
                    setUploadProgress({ completed: 0, total: files.length });
                    await uploadPreparedLocationPhotos(location.id, files, (completed, total) =>
                      setUploadProgress({ completed, total }),
                    );
                    await startPreparedLocationReconstruction(location.id);
                    setUploadProgress(null);
                  } else {
                    await uploadPreparedLocationGlb(location.id, files[0]!);
                  }
                });
              }}
            />
          </label>
          {uploadProgress ? (
            <p className="text-muted-foreground mt-3 text-sm" role="status">
              Saving photo {uploadProgress.completed} of {uploadProgress.total}. You can leave this
              page once all photos are saved.
            </p>
          ) : location.inputKind === "PHOTOS" && location.photoCount > 0 ? (
            <p className="text-muted-foreground mt-3 text-sm">
              {location.photoCount} photo{location.photoCount === 1 ? "" : "s"} saved. Add at least{" "}
              {Math.max(0, 20 - location.photoCount)} more before starting the room build.
            </p>
          ) : null}
        </section>
      ) : inFlight ? (
        <section
          className="border-border bg-card rounded-2xl border p-6 shadow-sm"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <span
              className="border-primary size-5 animate-spin rounded-full border-2 border-t-transparent"
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold">Building your room</h2>
          </div>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm">
            Your source files are saved. This page updates automatically, so you can continue
            working elsewhere and come back later.
          </p>
        </section>
      ) : location.status === "FAILED" || location.status === "NEEDS_ATTENTION" ? (
        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            {location.status === "FAILED" ? "Let’s try that build again" : "Ready to build"}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm">
            {location.photoCount} original photos remain safely attached to this location. You do
            not need to upload them again.
          </p>
          <Button
            type="button"
            className="mt-5"
            disabled={busy}
            onClick={() => void run(() => startPreparedLocationReconstruction(location.id))}
          >
            <RotateCcw />{" "}
            {busy ? "Starting…" : location.status === "FAILED" ? "Try build again" : "Build room"}
          </Button>
        </section>
      ) : (
        <p className="text-muted-foreground rounded-xl border p-5 text-sm">
          The room is saved, but its visual preview is unavailable. Your original files remain safe.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <details className="border-border bg-card rounded-xl border p-4">
          <summary className="focus-visible:ring-ring inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:ring-2 focus-visible:outline-none">
            Room details
          </summary>
          <dl className="text-muted-foreground mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt>Source</dt>
            <dd className="text-foreground">
              {location.inputKind === "PHOTOS" ? "Room photos" : "3D scan"}
            </dd>
            <dt>Scale</dt>
            <dd className="text-foreground">
              {location.environment ? "Estimated from the room" : "Not available yet"}
            </dd>
            <dt>Updated</dt>
            <dd className="text-foreground">{new Date(location.updatedAt).toLocaleString()}</dd>
          </dl>
        </details>
        <details className="border-border bg-card rounded-xl border p-4">
          <summary className="focus-visible:ring-ring inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:ring-2 focus-visible:outline-none">
            Source evidence
          </summary>
          <p className="text-muted-foreground mt-4 text-sm">
            {location.inputKind === "PHOTOS"
              ? `${location.photoCount} original photos are preserved with this location.`
              : "The original 3D scan is preserved with this location."}
          </p>
        </details>
      </div>

      <details className="border-border bg-card rounded-xl border p-4">
        <summary className="focus-visible:ring-ring inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:ring-2 focus-visible:outline-none">
          Replace or rebuild room
        </summary>
        <div className="mt-4 max-w-xl">
          <p className="text-muted-foreground text-sm">
            Prepare a new version from{" "}
            {location.inputKind === "PHOTOS" ? "updated room photos" : "an updated 3D scan"}. This
            version and its original source files will stay safe until the replacement is ready.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            disabled={busy}
            onClick={() => void prepareNewVersion()}
          >
            {busy ? "Preparing…" : "Prepare a new version"}
          </Button>
        </div>
      </details>
    </div>
  );
}
