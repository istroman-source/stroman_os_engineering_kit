import type { Prisma } from "@prisma/client";
import {
  createRetrospective,
  LessonId,
  RetrospectiveId,
  type Retrospective,
} from "@/domain/learning";
import { OwnerId, ProjectId } from "@/domain/project";
import { orThrowMapping } from "./shared";
import { PersistenceMappingError } from "../errors";
export type RetrospectiveRow = Prisma.RetrospectiveGetPayload<{ include: { lessons: true } }>;
export function toRetrospective(row: RetrospectiveRow): Retrospective {
  const orderedLessons = [...row.lessons].sort((a, b) => a.position - b.position);
  if (orderedLessons.some((lesson, index) => lesson.position !== index)) {
    throw new PersistenceMappingError(`retrospective lesson ordering="${row.id}"`);
  }
  const base = orThrowMapping(
    createRetrospective({
      id: orThrowMapping(RetrospectiveId.parse(row.id), `retrospective.id="${row.id}"`),
      ownerId: orThrowMapping(OwnerId.parse(row.ownerId), `retrospective.ownerId="${row.ownerId}"`),
      projectId: orThrowMapping(
        ProjectId.parse(row.projectId),
        `retrospective.projectId="${row.projectId}"`,
      ),
      context: { objective: row.objective, outcome: row.outcome, constraints: row.constraints },
      lessons: orderedLessons.map((lesson) => ({
        id: orThrowMapping(LessonId.parse(lesson.id), `lesson.id="${lesson.id}"`),
        category: lesson.category,
        content: lesson.content,
      })),
      now: row.createdAt,
    }),
    `retrospective aggregate="${row.id}"`,
  );
  if (
    row.lockVersion < 1 ||
    (row.status === "APPROVED") !== (row.approvedAt !== null && row.approvedBy !== null) ||
    (row.status === "APPROVED" &&
      (row.approvedBy !== row.ownerId || row.approvedAt! < row.createdAt))
  )
    throw new PersistenceMappingError(`retrospective lifecycle="${row.id}"`);
  return {
    ...base,
    status: row.status,
    approvedAt: row.approvedAt,
    approvedBy:
      row.approvedBy === null
        ? null
        : orThrowMapping(
            OwnerId.parse(row.approvedBy),
            `retrospective.approvedBy="${row.approvedBy}"`,
          ),
    lockVersion: row.lockVersion,
  };
}
export const toRetrospectiveFields = (value: Retrospective) => ({
  id: value.id,
  ownerId: value.ownerId,
  projectId: value.projectId,
  objective: value.context.objective,
  outcome: value.context.outcome,
  constraints: value.context.constraints,
  status: value.status,
  createdAt: value.createdAt,
  approvedAt: value.approvedAt,
  approvedBy: value.approvedBy,
  lockVersion: value.lockVersion,
});
export const toLessonRows = (value: Retrospective) =>
  value.lessons.map((lesson) => ({
    id: lesson.id,
    retrospectiveId: value.id,
    category: lesson.category,
    content: lesson.content,
    position: lesson.position,
  }));
