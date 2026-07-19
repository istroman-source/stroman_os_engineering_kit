import { ok, type Result } from "@/lib/result";
import {
  type CriterionAnchors,
  CriterionId,
  createRubric as createRubricAggregate,
  RubricId,
  type RubricRepository,
} from "@/domain/evaluation";
import { type DomainError, makeSlug } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import type { RepositoryError } from "../shared/errors";
import type { IdGenerator } from "../shared/id-generator";
import { type RubricView, toRubricView } from "./evaluation-view";

export interface CreateRubricDeps {
  readonly rubrics: RubricRepository;
  readonly ids: IdGenerator;
}

export interface CriterionDefinition {
  readonly name: string;
  readonly weight: number;
  readonly anchors: CriterionAnchors;
}

export interface CreateRubricInput {
  readonly slug: string;
  readonly title: string;
  readonly criteria: readonly CriterionDefinition[];
}

export type CreateRubricResult = Result<RubricView, DomainError | RepositoryError>;

export async function createRubric(
  deps: CreateRubricDeps,
  input: CreateRubricInput,
): Promise<CreateRubricResult> {
  const slug = makeSlug(input.slug);
  if (!slug.ok) return slug;

  const rubric = createRubricAggregate({
    id: RubricId.unsafe(deps.ids.generate(RubricId.prefix)),
    slug: slug.value,
    title: input.title,
    criteria: input.criteria.map((criterion) => ({
      id: CriterionId.unsafe(deps.ids.generate(CriterionId.prefix)),
      name: criterion.name,
      weight: criterion.weight,
      anchors: criterion.anchors,
    })),
  });
  if (!rubric.ok) return rubric;

  const saved = await attempt("rubric.insert", () => deps.rubrics.insert(rubric.value));
  if (!saved.ok) return saved;
  return ok(toRubricView(rubric.value));
}
