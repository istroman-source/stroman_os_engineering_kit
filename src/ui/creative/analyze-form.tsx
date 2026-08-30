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
  onSubmit,
}: {
  initial?: AnalyzeFields;
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
      ? [
          initial.client,
          initial.projectType,
          initial.creativeGoal,
          initial.targetAudience,
          initial.desiredEmotion,
          initial.context,
          initial.runtimeTarget,
          initial.deliveryPlatform,
          initial.references,
          initial.restrictions,
          initial.clientRequirements,
          initial.nonNegotiables,
          initial.successCriteria,
        ]
      : [];
    return details.some((value) => value.trim() !== "");
  });

  function set(key: keyof AnalyzeFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(fields);
  }

  const complete = fields.title.trim() !== "";

  return (
    <form onSubmit={handleSubmit} aria-label="Start a video" className="flex flex-col gap-5">
      <div className="border-primary/30 bg-primary/5 rounded-lg border p-4">
        <p className="text-sm font-medium">Start with one sentence</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Tell Stroman what you want to make. It will turn the idea into a shootable direction; you
          stay in control of every recommendation.
        </p>
      </div>
      <Field label="What are you making?" required>
        <input
          className={inputClass}
          value={fields.title}
          onChange={(e) => set("title", e.target.value)}
          maxLength={200}
          aria-label="What are you making?"
          required
          placeholder="e.g. A 30-second restaurant promo that feels like a Friday-night rush"
        />
      </Field>
      <button
        type="button"
        aria-expanded={showDetails}
        className="text-muted-foreground hover:text-foreground w-fit text-sm font-medium underline-offset-4 hover:underline"
        onClick={() => setShowDetails((current) => !current)}
      >
        {showDetails ? "Hide project details" : "Add details that change the plan (optional)"}
      </button>
      {showDetails ? (
        <div className="border-border grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
          <Field label="Who is this for?">
            <input
              className={inputClass}
              value={fields.client}
              onChange={(e) => set("client", e.target.value)}
              maxLength={200}
              aria-label="Client or owner"
              placeholder="Client, brand, or person"
            />
          </Field>
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
          <Field label="What should the audience feel or do?">
            <textarea
              className={inputClass}
              rows={2}
              value={fields.creativeGoal}
              onChange={(e) => set("creativeGoal", e.target.value)}
              maxLength={2000}
              aria-label="Creative intent"
              placeholder="The change you want to create"
            />
          </Field>
          <Field label="Who needs to see it?">
            <textarea
              className={inputClass}
              rows={2}
              value={fields.targetAudience}
              onChange={(e) => set("targetAudience", e.target.value)}
              maxLength={2000}
              aria-label="Target audience"
              placeholder="The people this is for"
            />
          </Field>
          <Field label="What should it feel like?">
            <input
              className={inputClass}
              value={fields.desiredEmotion}
              onChange={(e) => set("desiredEmotion", e.target.value)}
              placeholder="Hopeful, urgent, intimate…"
              maxLength={200}
              aria-label="Desired emotion"
            />
          </Field>
          <Field label="What do we need to work around?">
            <textarea
              className={inputClass}
              rows={4}
              value={fields.context}
              onChange={(e) => set("context", e.target.value)}
              placeholder="Locations, access, footage, duration, platform, or hard limits"
              maxLength={5000}
              aria-label="Source material and constraints"
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
          <Field label="What references matter?">
            <textarea
              className={inputClass}
              rows={3}
              value={fields.references}
              onChange={(e) => set("references", e.target.value)}
              placeholder="Films, campaigns, images, or approaches to learn from—not copy"
              maxLength={5000}
              aria-label="Creative references"
            />
          </Field>
          <Field label="What must Stroman avoid?">
            <textarea
              className={inputClass}
              rows={3}
              value={fields.restrictions}
              onChange={(e) => set("restrictions", e.target.value)}
              placeholder="Legal, safety, privacy, brand, access, or representation restrictions"
              maxLength={5000}
              aria-label="Restrictions"
            />
          </Field>
          <Field label="What has the client required?">
            <textarea
              className={inputClass}
              rows={3}
              value={fields.clientRequirements}
              onChange={(e) => set("clientRequirements", e.target.value)}
              placeholder="Messages, deliverables, products, people, or approvals"
              maxLength={5000}
              aria-label="Client requirements"
            />
          </Field>
          <Field label="What cannot change?">
            <textarea
              className={inputClass}
              rows={3}
              value={fields.nonNegotiables}
              onChange={(e) => set("nonNegotiables", e.target.value)}
              placeholder="The few creative or production truths the plan must protect"
              maxLength={5000}
              aria-label="Non-negotiables"
            />
          </Field>
          <Field label="How will you know it worked?">
            <textarea
              className={inputClass}
              rows={3}
              value={fields.successCriteria}
              onChange={(e) => set("successCriteria", e.target.value)}
              placeholder="The audience response, business result, or creative proof that matters"
              maxLength={5000}
              aria-label="Success criteria"
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
          {busy ? "Building your plan…" : "Make my plan"}
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
