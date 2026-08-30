"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Camera, ChevronRight, MapPin, Plus, X } from "lucide-react";
import { Button, buttonVariants } from "@/ui/primitives/button";
import { cn } from "@/ui/cn";
import {
  createPreparedLocation,
  errorStatus,
  friendlyError,
  listPreparedLocations,
  type PreparedLocationItem,
} from "@/ui/auth/api-client";

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring";

export function preparedLocationStatus(location: PreparedLocationItem): {
  label: string;
  detail: string;
  tone: string;
} {
  if (location.status === "READY")
    return {
      label: "Ready to use",
      detail: "Open the room and explore the reconstructed space.",
      tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  if (location.status === "FAILED")
    return {
      label: "Build needs attention",
      detail: "Your original files are safe. Open the room to try again.",
      tone: "bg-destructive/10 text-destructive",
    };
  if (location.status === "NEEDS_ATTENTION")
    return {
      label: location.inputKind === "PHOTOS" ? "Photos ready" : "Needs attention",
      detail:
        location.inputKind === "PHOTOS"
          ? "The room is ready to be built on your connected Mac."
          : "Open the room to finish setup.",
      tone: "bg-amber-500/10 text-amber-800 dark:text-amber-200",
    };
  if (location.status === "PROCESSING")
    return {
      label: "Building room",
      detail: "Stroman is connecting the images. You can leave this page.",
      tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    };
  if (location.status === "UPLOADING")
    return {
      label: "Adding files",
      detail: "Keeping the source files safely with this location.",
      tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    };
  return {
    label: "Add the room",
    detail: location.inputKind === "PHOTOS" ? "Choose 20–40 room photos." : "Choose a GLB scan.",
    tone: "bg-muted text-muted-foreground",
  };
}

/** A reusable pre-project library with one dominant action and plain-language states. */
export function LocationsView({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const [locations, setLocations] = useState<PreparedLocationItem[] | null>(null);
  const locationsRef = useRef<PreparedLocationItem[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [inputKind, setInputKind] = useState<"GLB" | "PHOTOS">("PHOTOS");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const items = await listPreparedLocations();
      locationsRef.current = items;
      setLocations(items);
    } catch (err) {
      if (errorStatus(err) === 401) router.replace("/login");
      else setError(friendlyError(err));
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    const initial = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => {
      if (
        active &&
        locationsRef.current?.some((location) =>
          ["UPLOADING", "PROCESSING"].includes(location.status),
        )
      ) {
        void refresh();
      }
    }, 5_000);
    return () => {
      active = false;
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [refresh]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createPreparedLocation({ name: name.trim(), inputKind });
      router.push(
        `/locations/${encodeURIComponent(created.id)}${
          returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""
        }`,
      );
    } catch (err) {
      if (errorStatus(err) === 401) router.replace("/login");
      else setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your rooms</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Build a room once, then return whenever a story needs it.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => {
            setAdding(true);
            setError(null);
          }}
          aria-expanded={adding}
        >
          <Plus aria-hidden="true" />
          Add a room
        </Button>
      </div>

      {adding ? (
        <section
          className="border-border bg-card rounded-2xl border p-5 shadow-sm sm:p-7"
          aria-labelledby="add-location-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.12em] uppercase">
                New location
              </p>
              <h2 id="add-location-title" className="mt-1 text-xl font-semibold">
                Which room are you preparing?
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setAdding(false)}
              aria-label="Close add location"
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          <form onSubmit={onCreate} className="mt-6 max-w-2xl space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Location name</span>
              <input
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Downtown kitchen"
                maxLength={160}
                autoFocus
              />
            </label>
            <fieldset>
              <legend className="text-sm font-medium">How would you like to add the room?</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                    inputKind === "PHOTOS"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <input
                    className="mt-1"
                    type="radio"
                    name="inputKind"
                    checked={inputKind === "PHOTOS"}
                    onChange={() => setInputKind("PHOTOS")}
                  />
                  <span>
                    <span className="flex items-center gap-2 font-medium">
                      <Camera aria-hidden="true" className="size-4" /> Photos
                    </span>
                    <span className="text-muted-foreground mt-1 block text-sm">
                      Use 20–40 overlapping room photos.
                    </span>
                  </span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                    inputKind === "GLB"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <input
                    className="mt-1"
                    type="radio"
                    name="inputKind"
                    checked={inputKind === "GLB"}
                    onChange={() => setInputKind("GLB")}
                  />
                  <span>
                    <span className="flex items-center gap-2 font-medium">
                      <Box aria-hidden="true" className="size-4" /> 3D scan
                    </span>
                    <span className="text-muted-foreground mt-1 block text-sm">
                      Use an existing textured GLB file.
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>
            <Button type="submit" size="lg" disabled={busy || !name.trim()}>
              {busy ? "Adding location…" : "Continue"}
              <ChevronRight aria-hidden="true" />
            </Button>
          </form>
        </section>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="text-destructive rounded-lg border border-current/20 p-3 text-sm"
        >
          {error}
        </p>
      ) : null}

      {locations === null ? (
        <p role="status" className="text-muted-foreground py-10 text-sm">
          Loading locations…
        </p>
      ) : locations.length === 0 ? (
        <section className="border-border bg-muted/25 grid min-h-64 place-items-center rounded-2xl border border-dashed p-8 text-center">
          <div className="max-w-sm">
            <span className="bg-primary/10 text-primary mx-auto grid size-11 place-items-center rounded-full">
              <MapPin aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">Add your first room</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Photograph a real room or bring an existing 3D scan. Stroman keeps it ready for future
              stories.
            </p>
            <Button type="button" className="mt-5" onClick={() => setAdding(true)}>
              <Plus aria-hidden="true" /> Add a room
            </Button>
          </div>
        </section>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {locations.map((location) => {
            const status = preparedLocationStatus(location);
            const action =
              location.status === "READY"
                ? "Open room"
                : location.status === "PROCESSING" || location.status === "UPLOADING"
                  ? "View progress"
                  : location.status === "FAILED" || location.status === "NEEDS_ATTENTION"
                    ? "Finish room"
                    : "Add room";
            return (
              <li
                key={location.id}
                className="border-border bg-card rounded-2xl border p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="bg-muted text-muted-foreground grid size-10 shrink-0 place-items-center rounded-xl">
                    {location.inputKind === "PHOTOS" ? (
                      <Camera aria-hidden="true" className="size-5" />
                    ) : (
                      <Box aria-hidden="true" className="size-5" />
                    )}
                  </span>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", status.tone)}>
                    {status.label}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{location.name}</h3>
                <p className="text-muted-foreground mt-1 min-h-10 text-sm">{status.detail}</p>
                <Link
                  href={`/locations/${encodeURIComponent(location.id)}${
                    returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""
                  }`}
                  className={cn(
                    buttonVariants({
                      variant: location.status === "READY" ? "default" : "outline",
                    }),
                    "mt-5 w-full sm:w-auto",
                  )}
                >
                  {action}
                  <ChevronRight aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
