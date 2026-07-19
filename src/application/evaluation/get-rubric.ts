import { err, ok, type Result } from "@/lib/result";
import type { RubricId, RubricRepository } from "@/domain/evaluation";
import { attempt } from "../shared/attempt";
import { NotFoundError, type RepositoryError } from "../shared/errors";
import { type RubricView, toRubricView } from "./evaluation-view";

export interface GetRubricDeps {
  readonly rubrics: RubricRepository;
}

export interface GetRubricInput {
  readonly rubricId: RubricId;
}

export type GetRubricResult = Result<RubricView, NotFoundError | RepositoryError>;

export async function getRubric(
  deps: GetRubricDeps,
  input: GetRubricInput,
): Promise<GetRubricResult> {
  const loaded = await attempt("rubric.findById", () => deps.rubrics.findById(input.rubricId));
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("Rubric", input.rubricId));
  return ok(toRubricView(loaded.value));
}
