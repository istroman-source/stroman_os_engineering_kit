import { err, ok, type Result } from "@/lib/result";
import { type Confidence, type DomainError, validateBoundedText } from "../shared";
import type { OwnerId, ProjectId } from "../project/project-id";
import type { DecisionId } from "./decision-id";
import {
  DecisionAlreadyDecidedError,
  DuplicateOptionError,
  InsufficientOptionsError,
  UnknownOptionError,
} from "./decision-errors";

export type DecisionStatus = "PROPOSED" | "DECIDED";

export interface DecisionOption {
  readonly id: string;
  readonly label: string;
  readonly rationale: string | null;
}

/**
 * Non-binding AI input to a decision. An advisory may recommend an option and
 * carry a confidence, but it can never select the option or move the decision to
 * DECIDED — only a human, via `decide`, does that.
 */
export interface Advisory {
  readonly recommendedOptionId: string | null;
  readonly rationale: string;
  readonly confidence: Confidence;
}

/**
 * A recorded creative decision. Aggregate root of the Decision domain. The core
 * product invariant is enforced here: a human holds final authority.
 */
export interface Decision {
  readonly id: DecisionId;
  readonly projectId: ProjectId;
  readonly question: string;
  readonly options: readonly DecisionOption[];
  readonly advisory: Advisory | null;
  readonly status: DecisionStatus;
  readonly selectedOptionId: string | null;
  readonly decidedBy: OwnerId | null;
  readonly decisionRationale: string | null;
  readonly createdAt: Date;
  readonly decidedAt: Date | null;
  /**
   * Optimistic-concurrency token, managed by the persistence layer. Ensures a
   * stale write (e.g. a duplicate human finalization) cannot overwrite newer state.
   */
  readonly lockVersion: number;
}

export interface DecisionOptionInput {
  readonly id: string;
  readonly label: string;
  readonly rationale?: string | null;
}

export interface CreateDecisionInput {
  readonly id: DecisionId;
  readonly projectId: ProjectId;
  readonly question: string;
  readonly options: readonly DecisionOptionInput[];
  readonly advisory?: Advisory | null;
  readonly now: Date;
}

function hasOption(options: readonly DecisionOption[], optionId: string): boolean {
  return options.some((option) => option.id === optionId);
}

export function createDecision(input: CreateDecisionInput): Result<Decision, DomainError> {
  const question = validateBoundedText(input.question, { label: "Decision question", max: 500 });
  if (!question.ok) return question;
  if (input.options.length < 2) return err(new InsufficientOptionsError());

  const seen = new Set<string>();
  const options: DecisionOption[] = [];
  for (const option of input.options) {
    const id = option.id.trim();
    if (id.length === 0) return err(new UnknownOptionError(option.id));
    if (seen.has(id)) return err(new DuplicateOptionError(id));
    seen.add(id);
    const label = validateBoundedText(option.label, { label: "Option label", max: 200 });
    if (!label.ok) return label;
    options.push({ id, label: label.value, rationale: option.rationale ?? null });
  }

  const advisory = input.advisory ?? null;
  if (advisory?.recommendedOptionId != null && !hasOption(options, advisory.recommendedOptionId)) {
    return err(new UnknownOptionError(advisory.recommendedOptionId));
  }

  return {
    ok: true,
    value: {
      id: input.id,
      projectId: input.projectId,
      question: question.value,
      options,
      advisory,
      status: "PROPOSED",
      selectedOptionId: null,
      decidedBy: null,
      decisionRationale: null,
      createdAt: input.now,
      decidedAt: null,
      lockVersion: 1,
    },
  };
}

/**
 * Attach or replace AI advisory input on a proposed decision. This never decides
 * the decision; it only records advice for a human to consider.
 */
export function attachAdvisory(
  decision: Decision,
  advisory: Advisory,
): Result<Decision, DomainError> {
  if (decision.status === "DECIDED") return err(new DecisionAlreadyDecidedError());
  if (
    advisory.recommendedOptionId != null &&
    !hasOption(decision.options, advisory.recommendedOptionId)
  ) {
    return err(new UnknownOptionError(advisory.recommendedOptionId));
  }
  return ok({ ...decision, advisory });
}

export interface DecideInput {
  /** The option the human selected. Must belong to the decision. */
  readonly selectedOptionId: string;
  /** The human making the decision. Required — AI cannot occupy this role. */
  readonly decidedBy: OwnerId;
  /** The human's reasoning. Required by the product principle. */
  readonly rationale: string;
  readonly now: Date;
}

/**
 * Record a human's final decision. This is the ONLY path to DECIDED, and it
 * requires an explicit human selection, a deciding human, and a rationale.
 */
export function decide(decision: Decision, input: DecideInput): Result<Decision, DomainError> {
  if (decision.status === "DECIDED") return err(new DecisionAlreadyDecidedError());
  if (!hasOption(decision.options, input.selectedOptionId)) {
    return err(new UnknownOptionError(input.selectedOptionId));
  }
  const rationale = validateBoundedText(input.rationale, {
    label: "Decision rationale",
    max: 2000,
  });
  if (!rationale.ok) return rationale;

  return ok({
    ...decision,
    status: "DECIDED",
    selectedOptionId: input.selectedOptionId,
    decidedBy: input.decidedBy,
    decisionRationale: rationale.value,
    decidedAt: input.now,
  });
}
