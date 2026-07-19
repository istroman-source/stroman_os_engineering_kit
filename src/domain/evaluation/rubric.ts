import { err, ok, type Result } from "@/lib/result";
import { type DomainError, type Score, type Slug, validateBoundedText } from "../shared";
import type { CriterionId, RubricId } from "./evaluation-id";
import {
  DuplicateCriterionError,
  EmptyRubricError,
  IncompleteScoringError,
  InvalidCriterionWeightError,
} from "./evaluation-errors";

/** Written descriptions for the 1, 5, and 10 points of a criterion's scale. */
export interface CriterionAnchors {
  readonly one: string;
  readonly five: string;
  readonly ten: string;
}

export interface RubricCriterion {
  readonly id: CriterionId;
  readonly name: string;
  readonly weight: number;
  readonly anchors: CriterionAnchors;
}

/** A weighted set of scoring criteria. Aggregate root; criteria are owned. */
export interface Rubric {
  readonly id: RubricId;
  readonly slug: Slug;
  readonly title: string;
  readonly criteria: readonly RubricCriterion[];
}

export interface RubricCriterionInput {
  readonly id: CriterionId;
  readonly name: string;
  readonly weight: number;
  readonly anchors: CriterionAnchors;
}

export interface CreateRubricInput {
  readonly id: RubricId;
  readonly slug: Slug;
  readonly title: string;
  readonly criteria: readonly RubricCriterionInput[];
}

export function createRubric(input: CreateRubricInput): Result<Rubric, DomainError> {
  const title = validateBoundedText(input.title, { label: "Rubric title", max: 200 });
  if (!title.ok) return title;
  if (input.criteria.length === 0) return err(new EmptyRubricError());

  const seen = new Set<string>();
  const criteria: RubricCriterion[] = [];
  for (const c of input.criteria) {
    if (seen.has(c.id)) return err(new DuplicateCriterionError(c.id));
    seen.add(c.id);
    if (!Number.isFinite(c.weight) || c.weight <= 0) {
      return err(new InvalidCriterionWeightError(c.id));
    }
    const name = validateBoundedText(c.name, { label: "Criterion name", max: 120 });
    if (!name.ok) return name;
    for (const [label, text] of Object.entries(c.anchors)) {
      const anchor = validateBoundedText(text, { label: `Anchor "${label}"`, max: 500 });
      if (!anchor.ok) return anchor;
    }
    criteria.push({ id: c.id, name: name.value, weight: c.weight, anchors: c.anchors });
  }

  return ok({ id: input.id, slug: input.slug, title: title.value, criteria });
}

/**
 * Weighted average score (on the 1–10 scale) for a full set of criterion scores.
 * Requires a score for every criterion; otherwise returns which are missing.
 */
export function weightedScore(
  rubric: Rubric,
  scores: ReadonlyMap<CriterionId, Score>,
): Result<number, IncompleteScoringError> {
  const missing: CriterionId[] = [];
  let weightedSum = 0;
  let totalWeight = 0;
  for (const criterion of rubric.criteria) {
    const score = scores.get(criterion.id);
    if (score === undefined) {
      missing.push(criterion.id);
      continue;
    }
    weightedSum += criterion.weight * score;
    totalWeight += criterion.weight;
  }
  if (missing.length > 0) return err(new IncompleteScoringError(missing));
  return ok(weightedSum / totalWeight);
}
