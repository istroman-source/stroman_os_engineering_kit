import { Button } from "@/ui/primitives/button";
import type { AnalyzeFields } from "./creative-api";

export interface BriefUnderstanding {
  readonly understood: readonly string[];
  readonly decided: readonly string[];
  readonly needsInput: readonly string[];
}

const sentence = (value: string) => value.trim().replace(/[.\s]+$/, "");

function suppliedStatements(value: string): string[] {
  return value
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((item) => sentence(item))
    .filter(Boolean);
}

/**
 * A deliberately conservative reading of filmmaker-supplied language. This is
 * not creative development: it only repeats clear facts and surfaces a small
 * number of decisions that genuinely affect the next step.
 */
export function understandBrief(fields: AnalyzeFields): BriefUnderstanding {
  const statements = suppliedStatements(fields.context);
  const understood = statements.length ? statements : ["You have not described the film yet."];
  const decided: string[] = [];

  if (fields.projectType.trim()) decided.push(`Project type: ${sentence(fields.projectType)}.`);
  if (fields.deliveryPlatform.trim())
    decided.push(`Platforms: ${sentence(fields.deliveryPlatform)}.`);
  if (fields.creativeGoal.trim()) decided.push(`Purpose: ${sentence(fields.creativeGoal)}.`);
  if (fields.targetAudience.trim()) decided.push(`Audience: ${sentence(fields.targetAudience)}.`);
  if (fields.desiredEmotion.trim())
    decided.push(`Intended feeling: ${sentence(fields.desiredEmotion)}.`);
  if (fields.runtimeTarget.trim()) decided.push(`Runtime: ${sentence(fields.runtimeTarget)}.`);
  if (fields.clientRequirements.trim())
    decided.push(`Required: ${sentence(fields.clientRequirements)}.`);
  if (fields.nonNegotiables.trim()) decided.push(`Must-have: ${sentence(fields.nonNegotiables)}.`);
  if (fields.restrictions.trim()) decided.push(`Constraint: ${sentence(fields.restrictions)}.`);

  const needsInput: string[] = [];
  if (!fields.runtimeTarget.trim() && !/\b\d+\s*(second|minute|min|hour)/i.test(fields.context)) {
    needsInput.push("How long should each finished piece be?");
  }
  if (!fields.context.trim() && needsInput.length === 0) {
    needsInput.push("What should the finished film help people understand, feel, or do?");
  }
  return { understood, decided, needsInput: needsInput.slice(0, 3) };
}

export function BriefUnderstandingView({
  title,
  fields,
  busy,
  error,
  onContinue,
  onEdit,
}: {
  title: string;
  fields: AnalyzeFields;
  busy: boolean;
  error?: string | null;
  onContinue: () => void;
  onEdit: () => void;
}) {
  const reading = understandBrief(fields);
  return (
    <section
      className="mx-auto flex w-full max-w-3xl flex-col gap-7"
      aria-labelledby="brief-received"
    >
      <header>
        <p className="text-primary text-sm font-semibold tracking-wide">BRIEF RECEIVED</p>
        <h1 id="brief-received" className="mt-2 text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Before Stroman develops ideas, make sure this reflects what you meant.
        </p>
      </header>
      <UnderstandingSection title="What I understood" items={reading.understood} />
      <UnderstandingSection
        title="What you already decided"
        items={reading.decided}
        empty="No separate format details were added. Your brief above remains the source of truth."
      />
      <UnderstandingSection
        title="What still needs your input"
        items={reading.needsInput}
        empty="Your brief is already well defined. Nothing material needs an answer before the next step."
      />
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3 border-t pt-5">
        <Button onClick={onContinue} disabled={busy}>
          {busy ? "Continuing…" : "Looks right — Continue"}
        </Button>
        <Button type="button" variant="secondary" onClick={onEdit} disabled={busy}>
          Edit brief
        </Button>
      </div>
    </section>
  );
}

function UnderstandingSection({
  title,
  items,
  empty,
}: {
  title: string;
  items: readonly string[];
  empty?: string;
}) {
  return (
    <section className="border-border bg-card rounded-lg border p-5" aria-labelledby={title}>
      <h2 id={title} className="text-sm font-semibold tracking-wide uppercase">
        {title}
      </h2>
      {items.length ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">{empty}</p>
      )}
    </section>
  );
}
