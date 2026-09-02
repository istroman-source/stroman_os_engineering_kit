import { Button } from "@/ui/primitives/button";
import type { AnalyzeFields } from "./creative-api";

export interface BriefUnderstanding {
  readonly understood: readonly string[];
  readonly decided: readonly string[];
  readonly needsInput: readonly string[];
}

const sentence = (value: string) => value.trim().replace(/[.\s]+$/, "");
const has = (text: string, expression: RegExp) => expression.test(text);

/**
 * A deliberately conservative reading of filmmaker-supplied language. This is
 * not creative development: it only repeats clear facts and surfaces a small
 * number of decisions that genuinely affect the next step.
 */
export function understandBrief(fields: AnalyzeFields): BriefUnderstanding {
  const text = [
    fields.context,
    fields.projectType,
    fields.creativeGoal,
    fields.targetAudience,
    fields.runtimeTarget,
    fields.deliveryPlatform,
    fields.restrictions,
    fields.nonNegotiables,
  ]
    .join(" ")
    .toLowerCase();
  const understood: string[] = [];
  const decided: string[] = [];

  if (fields.projectType.trim()) decided.push(`Project type: ${sentence(fields.projectType)}.`);
  if (has(text, /\b(series|recurring)\b/)) {
    understood.push("This is a repeatable series.");
    decided.push("Format: recurring series.");
  }
  if (has(text, /\bsocial media|instagram|tiktok|\bx\b/)) {
    understood.push("This is intended as short-form social content.");
  }
  if (has(text, /\bchef\b/)) {
    understood.push("The chef is the on-screen subject.");
    decided.push("Subject: chef and dish.");
  }
  if (has(text, /ticket to (the )?(table|expo)|from (the )?ticket/)) {
    understood.push("Each episode follows a dish from the ticket through to expo.");
    decided.push("Structure: begins with the ticket and stops at expo.");
  }
  if (has(text, /\bexpo\b/) && !decided.some((item) => /expo/i.test(item))) {
    understood.push("Coverage stops at the expo station.");
    decided.push("Constraint: coverage ends at expo.");
  }
  if (has(text, /\bfresh\b/)) understood.push("The food should feel fresh and immediate.");
  if (has(text, /\bbell\b/)) {
    understood.push("A bell ringing is the ending beat.");
    decided.push("Required ending: bell rings.");
  }
  if (fields.deliveryPlatform.trim())
    decided.push(`Platforms: ${sentence(fields.deliveryPlatform)}.`);
  else if (has(text, /instagram|tiktok|\bx\b/))
    decided.push("Platforms: Instagram, X, and TikTok.");
  if (fields.creativeGoal.trim()) decided.push(`Purpose: ${sentence(fields.creativeGoal)}.`);
  else if (has(text, /brand identity|engage/)) {
    decided.push("Purpose: strengthen brand identity and engage the audience.");
  }
  if (fields.runtimeTarget.trim()) decided.push(`Runtime: ${sentence(fields.runtimeTarget)}.`);
  if (fields.nonNegotiables.trim()) decided.push(`Must-have: ${sentence(fields.nonNegotiables)}.`);
  if (fields.restrictions.trim()) decided.push(`Constraint: ${sentence(fields.restrictions)}.`);

  if (understood.length === 0 && fields.context.trim()) {
    understood.push(sentence(fields.context));
  }

  const needsInput: string[] = [];
  if (!fields.runtimeTarget.trim() && !has(text, /\b\d+\s*(second|minute|min|hour)/)) {
    needsInput.push("How long should each finished piece be?");
  }
  if (
    has(text, /chef.*(explain|describe)|explain.*chef|describe.*chef/) &&
    !has(text, /voiceover|voice-over|live dialogue|spoken/)
  ) {
    needsInput.push("Should the chef speak live, or should the explanation be voiceover?");
  }
  if (has(text, /\b(series|recurring)\b/) && !has(text, /\bhook\b|opening/)) {
    needsInput.push("Is there a repeatable opening hook you want every episode to use?");
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
        empty="Nothing additional was stated yet."
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
