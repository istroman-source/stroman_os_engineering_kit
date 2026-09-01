"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/ui/primitives/button";
import type { AnalyzeFields, IntentRevision } from "./creative-api";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const EMPTY: AnalyzeFields = {
  title: "",
  client: "",
  projectType: "",
  creativeGoal: "",
  targetAudience: "",
  desiredEmotion: "",
  context: "",
  runtimeTarget: "",
  deliveryPlatform: "",
  references: "",
  restrictions: "",
  clientRequirements: "",
  nonNegotiables: "",
  successCriteria: "",
};

function editableFields(initial?: AnalyzeFields): AnalyzeFields {
  if (!initial) return EMPTY;
  return {
    title: initial.title,
    client: initial.client,
    projectType: initial.projectType,
    creativeGoal: initial.creativeGoal,
    targetAudience: initial.targetAudience,
    desiredEmotion: initial.desiredEmotion,
    context: initial.context,
    runtimeTarget: initial.runtimeTarget,
    deliveryPlatform: initial.deliveryPlatform,
    references: initial.references,
    restrictions: initial.restrictions,
    clientRequirements: initial.clientRequirements,
    nonNegotiables: initial.nonNegotiables,
    successCriteria: initial.successCriteria,
  };
}

/**
 * Captures the creator's context for a project. No uploads — the creator states
 * what they're making and why, and Stroman OS analyzes it into a blueprint.
 */
export function AnalyzeForm({
  initial,
  history = [],
  busy,
  error,
  defaultTitle,
  onSubmit,
}: {
  initial?: AnalyzeFields;
  defaultTitle: string;
  history?: readonly IntentRevision[];
  busy: boolean;
  error: string | null;
  onSubmit: (fields: AnalyzeFields) => void;
}) {
  // A saved brief also carries response-only metadata (ids, timestamps, and
  // planning context). Copy only editable fields into form state so a later
  // update cannot spread that metadata into the API's strict request body.
  const [fields, setFields] = useState<AnalyzeFields>(() => editableFields(initial));
  const [showDetails, setShowDetails] = useState(() => {
    const details = initial
      ? [initial.projectType, initial.runtimeTarget, initial.deliveryPlatform]
      : [];
    return details.some((value) => value.trim() !== "");
  });

  function set(key: keyof AnalyzeFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ ...fields, title: fields.title.trim() || defaultTitle.trim() });
  }

  const hasLegacyIntent = [
    fields.creativeGoal,
    fields.targetAudience,
    fields.desiredEmotion,
    fields.references,
    fields.restrictions,
    fields.clientRequirements,
    fields.nonNegotiables,
    fields.successCriteria,
  ].some((value) => value.trim() !== "");
  const complete =
    (fields.title.trim() !== "" || defaultTitle.trim() !== "") &&
    (fields.context.trim() !== "" || hasLegacyIntent);

  return (
    <form onSubmit={handleSubmit} aria-label="Start a video" className="flex flex-col gap-5">
      <div className="border-primary/30 bg-primary/5 rounded-lg border p-4">
        <p className="text-sm font-medium">One brief is enough</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Write naturally or paste everything you already know. You do not need to sort the idea
          into separate boxes.
        </p>
      </div>
      <Field label="Describe the video" required>
        <textarea
          className={inputClass}
          rows={12}
          value={fields.context}
          onChange={(e) => set("context", e.target.value)}
          maxLength={20000}
          aria-label="Describe the video"
          required={!hasLegacyIntent}
          placeholder="Tell Stroman the story, song or subject, feeling, audience, locations, people, moments you can picture, references, must-haves, and anything to avoid. Use as much detail as you need."
        />
        <span className="text-muted-foreground text-right text-xs">
          {fields.context.length.toLocaleString()} / 20,000
        </span>
      </Field>
      <button
        type="button"
        aria-expanded={showDetails}
        className="text-muted-foreground hover:text-foreground w-fit text-sm font-medium underline-offset-4 hover:underline"
        onClick={() => setShowDetails((current) => !current)}
      >
        {showDetails ? "Hide format details" : "Add format details (optional)"}
      </button>
      {showDetails ? (
        <div className="border-border grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
          <Field label="What kind of video is it?">
            <input
              className={inputClass}
              value={fields.projectType}
              onChange={(e) => set("projectType", e.target.value)}
              placeholder="Commercial, documentary, short film…"
              maxLength={120}
              aria-label="Project type"
            />
          </Field>
          <Field label="How long should it be?">
            <input
              className={inputClass}
              value={fields.runtimeTarget}
              onChange={(e) => set("runtimeTarget", e.target.value)}
              placeholder="30 seconds, 8 minutes, flexible…"
              maxLength={200}
              aria-label="Runtime target"
            />
          </Field>
          <Field label="Where will people watch it?">
            <input
              className={inputClass}
              value={fields.deliveryPlatform}
              onChange={(e) => set("deliveryPlatform", e.target.value)}
              placeholder="Broadcast, cinema, YouTube, Instagram…"
              maxLength={300}
              aria-label="Delivery platform"
            />
          </Field>
        </div>
      ) : null}
      {history.length > 0 ? (
        <details className="border-border rounded-lg border px-4 py-3">
          <summary className="focus-visible:ring-ring min-h-11 cursor-pointer content-center text-sm font-medium focus-visible:ring-2 focus-visible:outline-none">
            Intent history · {history.length} saved {history.length === 1 ? "version" : "versions"}
          </summary>
          <ol className="border-border mt-3 space-y-3 border-t pt-3">
            {[...history].reverse().map((revision) => (
              <li key={revision.version} className="text-sm">
                <p className="font-medium">Version {revision.version}</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(revision.createdAt).toLocaleString()}
                </p>
                <p className="mt-1">{revision.title}</p>
                {revision.creativeGoal ? (
                  <p className="text-muted-foreground mt-1">Objective: {revision.creativeGoal}</p>
                ) : null}
                {revision.nonNegotiables ? (
                  <p className="text-muted-foreground mt-1">Protected: {revision.nonNegotiables}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </details>
      ) : null}
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={busy || !complete}>
          {busy ? "Building your plan…" : initial ? "Rebuild my plan" : "Make my plan"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">
        {label}
        <span className="text-muted-foreground ml-1 text-xs font-normal">
          {required ? "Required" : "Optional"}
        </span>
      </span>
      {children}
    </label>
  );
}
