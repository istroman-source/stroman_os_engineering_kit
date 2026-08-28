"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/ui/primitives/button";
import type { AnalyzeFields } from "./creative-api";

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
  };
}

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
  // A saved brief also carries response-only metadata (ids, timestamps, and
  // planning context). Copy only editable fields into form state so a later
  // update cannot spread that metadata into the API's strict request body.
  const [fields, setFields] = useState<AnalyzeFields>(() => editableFields(initial));

  function set(key: keyof AnalyzeFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(fields);
  }

  const complete = fields.title.trim() !== "";

  return (
    <form onSubmit={handleSubmit} aria-label="Develop idea" className="flex flex-col gap-4">
      <div className="border-primary/30 bg-primary/5 rounded-lg border p-4">
        <p className="text-sm font-medium">Start with the idea</p>
        <p className="text-muted-foreground mt-1 text-xs">
          This is the only required field. Add details below only when they change the creative
          direction.
        </p>
      </div>
      <Field label="Video concept" required>
        <input
          className={inputClass}
          value={fields.title}
          onChange={(e) => set("title", e.target.value)}
          maxLength={200}
          aria-label="Video concept"
          required
          placeholder="e.g. A night-shift baker teaches his daughter the family recipe before selling the bakery"
        />
      </Field>
      <Field label="Client or owner">
        <input
          className={inputClass}
          value={fields.client}
          onChange={(e) => set("client", e.target.value)}
          maxLength={200}
          aria-label="Client or owner"
          placeholder="Optional"
        />
      </Field>
      <Field label="Project type">
        <input
          className={inputClass}
          value={fields.projectType}
          onChange={(e) => set("projectType", e.target.value)}
          placeholder="Optional — documentary, short film, commercial, performance…"
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
          placeholder="Optional — what should change for the audience?"
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
          placeholder="Optional — who has the most at stake?"
        />
      </Field>
      <Field label="Desired emotion">
        <input
          className={inputClass}
          value={fields.desiredEmotion}
          onChange={(e) => set("desiredEmotion", e.target.value)}
          placeholder="Optional — e.g. unsettled, hungry, hopeful, implicated"
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
          placeholder="Optional — access, people, locations, source material, duration, platform, resources, and hard constraints."
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
          {busy ? "Developing…" : "Develop creative direction"}
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
