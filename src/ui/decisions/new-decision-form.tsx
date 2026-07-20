"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/ui/primitives/button";
import { errorStatus, friendlyError } from "@/ui/auth/api-client";
import { type Decision, proposeDecision } from "./decisions-api";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Frame a new creative decision: a question plus the options under consideration.
 * The decision — not a task — is the unit of work, so the question is required and
 * at least two options must be given (the domain enforces both).
 */
export function NewDecisionForm({
  projectId,
  onCreated,
  onUnauthorized,
}: {
  projectId: string;
  onCreated: (decision: Decision) => void;
  onUnauthorized: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [labels, setLabels] = useState<string[]>(["", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setLabel(index: number, value: string) {
    setLabels((current) => current.map((label, i) => (i === index ? value : label)));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = question.trim();
    const options = labels
      .map((label, index) => ({ id: `opt-${index + 1}`, label: label.trim() }))
      .filter((option) => option.label !== "");
    if (q === "" || options.length < 2) {
      setError("Give the decision a question and at least two options.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data } = await proposeDecision({ projectId, question: q, options });
      setQuestion("");
      setLabels(["", ""]);
      onCreated(data);
    } catch (err) {
      if (errorStatus(err) === 401) {
        onUnauthorized();
        return;
      }
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Frame a decision"
      className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">What decision are you making?</span>
        <input
          className={inputClass}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Which opening shot for the signature dish reel?"
          maxLength={500}
          aria-label="Decision question"
        />
      </label>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Options</span>
        {labels.map((label, index) => (
          <input
            key={index}
            className={inputClass}
            value={label}
            onChange={(e) => setLabel(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            maxLength={200}
            aria-label={`Option ${index + 1}`}
          />
        ))}
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setLabels((current) => [...current, ""])}
            disabled={labels.length >= 50}
          >
            Add option
          </Button>
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={busy}>
          {busy ? "Framing…" : "Frame decision"}
        </Button>
      </div>
    </form>
  );
}
