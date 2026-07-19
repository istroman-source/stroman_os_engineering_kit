import type { Prisma } from "@prisma/client";
import { CriterionId, type Rubric, type RubricCriterion, RubricId } from "@/domain/evaluation";
import { makeSlug } from "@/domain/shared";
import { orThrowMapping } from "./shared";

export type RubricRow = Prisma.RubricGetPayload<{ include: { criteria: true } }>;

export function toRubric(row: RubricRow): Rubric {
  const criteria: RubricCriterion[] = [...row.criteria]
    .sort((a, b) => a.position - b.position)
    .map((criterion) => ({
      id: orThrowMapping(CriterionId.parse(criterion.id), `criterion.id="${criterion.id}"`),
      name: criterion.name,
      weight: criterion.weight,
      anchors: {
        one: criterion.anchorOne,
        five: criterion.anchorFive,
        ten: criterion.anchorTen,
      },
    }));

  return {
    id: orThrowMapping(RubricId.parse(row.id), `rubric.id="${row.id}"`),
    slug: orThrowMapping(makeSlug(row.slug), `rubric.slug="${row.slug}"`),
    title: row.title,
    criteria,
  };
}

export function toRubricFields(rubric: Rubric) {
  return { id: rubric.id, slug: rubric.slug, title: rubric.title };
}

export function toRubricCriteriaRows(rubric: Rubric) {
  return rubric.criteria.map((criterion, index) => ({
    id: criterion.id,
    rubricId: rubric.id,
    name: criterion.name,
    weight: criterion.weight,
    anchorOne: criterion.anchors.one,
    anchorFive: criterion.anchors.five,
    anchorTen: criterion.anchors.ten,
    position: index,
  }));
}
