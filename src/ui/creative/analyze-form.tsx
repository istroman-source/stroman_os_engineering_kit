"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/ui/primitives/button";
import type { AnalyzeFields } from "./creative-api";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const EMPTY: AnalyzeFields = {
  title: "",
  client: "",
  projectType: "",
  creativeGoal: "",
  targetAudience: "",
  desiredEmotion: "",
  context: "",
};

/**
 * Captures the creator's context for a project. No uploads — the creator states
 * what they're making and why, and Stroman OS analyzes it into a blueprint.
 */
export function AnalyzeForm({
  initial,
  busy,
  error,
  onSubmit,
}: {
  initial?: AnalyzeFields;
  busy: boolean;
  error: string | null;
  onSubmit: (fields: AnalyzeFields) => void;
}) {
  const [fields, setFields] = useState<AnalyzeFields>(initial ?? EMPTY);

  function set(key: keyof AnalyzeFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(fields);
  }

  const complete = Object.values(fields).every((value) => value.trim() !== "");

  return (
    <form onSubmit={handleSubmit} aria-label="Describe video" className="flex flex-col gap-4">
      <Field label="Video concept">
        <input
          className={inputClass}
          value={fields.title}
          onChange={(e) => set("title", e.target.value)}
          maxLength={200}
          aria-label="Video concept"
        />
      </Field>
      <Field label="Client">
        <input
          className={inputClass}
          value={fields.client}
          onChange={(e) => set("client", e.target.value)}
          maxLength={200}
          aria-label="Client"
        />
      </Field>
      <Field label="Project type">
        <input
          className={inputClass}
          value={fields.projectType}
          onChange={(e) => set("projectType", e.target.value)}
          placeholder="e.g. Instagram reel, brand documentary, testimonial"
          maxLength={120}
          aria-label="Project type"
        />
      </Field>
      <Field label="Creative intent">
        <textarea
          className={inputClass}
          rows={2}
          value={fields.creativeGoal}
          onChange={(e) => set("creativeGoal", e.target.value)}
          maxLength={2000}
          aria-label="Creative intent"
        />
      </Field>
      <Field label="Target audience">
        <textarea
          className={inputClass}
          rows={2}
          value={fields.targetAudience}
          onChange={(e) => set("targetAudience", e.target.value)}
          maxLength={2000}
          aria-label="Target audience"
        />
      </Field>
      <Field label="Desired emotion">
        <input
          className={inputClass}
          value={fields.desiredEmotion}
          onChange={(e) => set("desiredEmotion", e.target.value)}
          placeholder="e.g. inspired, hungry, trusting"
          maxLength={200}
          aria-label="Desired emotion"
        />
      </Field>
      <Field label="Source material and constraints">
        <textarea
          className={inputClass}
          rows={4}
          value={fields.context}
          onChange={(e) => set("context", e.target.value)}
          placeholder="Summarize available footage, transcripts, references, required beats, duration, platform, and other constraints."
          maxLength={5000}
          aria-label="Source material and constraints"
        />
      </Field>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={busy || !complete}>
          {busy ? "Building…" : "Build story plan"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
