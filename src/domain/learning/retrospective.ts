import { err, ok, type Result } from "@/lib/result";
import type { OwnerId, ProjectId } from "../project";
import { type DomainError, InvalidValueError, validateBoundedText } from "../shared";
import type { LessonId, RetrospectiveId } from "./ids";
import {
  DuplicateLessonError,
  EmptyRetrospectiveError,
  RetrospectiveAlreadyApprovedError,
} from "./learning-errors";

export type LessonCategory =
  | "WORKED"
  | "FAILED"
  | "SURPRISED"
  | "UNUSED_FOOTAGE"
  | "CLIENT_FEEDBACK"
  | "AUDIENCE_RESPONSE"
  | "TIME_SINK"
  | "REPEAT"
  | "AVOID";
export type RetrospectiveStatus = "DRAFT" | "APPROVED";
export interface ProjectContextSnapshot {
  readonly objective: string;
  readonly outcome: string;
  readonly constraints: string | null;
}
export interface Lesson {
  readonly id: LessonId;
  readonly category: LessonCategory;
  readonly content: string;
  readonly position: number;
}
export interface Retrospective {
  readonly id: RetrospectiveId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly context: ProjectContextSnapshot;
  readonly lessons: readonly Lesson[];
  readonly status: RetrospectiveStatus;
  readonly createdAt: Date;
  readonly approvedAt: Date | null;
  readonly approvedBy: OwnerId | null;
  readonly lockVersion: number;
}
export interface CreateRetrospectiveInput {
  id: RetrospectiveId;
  ownerId: OwnerId;
  projectId: ProjectId;
  context: ProjectContextSnapshot;
  lessons: readonly Omit<Lesson, "position">[];
  now: Date;
}
export function createRetrospective(
  input: CreateRetrospectiveInput,
): Result<Retrospective, DomainError> {
  if (input.lessons.length === 0) return err(new EmptyRetrospectiveError());
  const objective = validateBoundedText(input.context.objective, {
    label: "Project objective",
    max: 1000,
  });
  if (!objective.ok) return objective;
  const outcome = validateBoundedText(input.context.outcome, {
    label: "Project outcome",
    max: 2000,
  });
  if (!outcome.ok) return outcome;
  let constraints: string | null = null;
  if (input.context.constraints != null) {
    const value = validateBoundedText(input.context.constraints, {
      label: "Project constraints",
      max: 2000,
    });
    if (!value.ok) return value;
    constraints = value.value;
  }
  const seen = new Set<string>();
  const lessons: Lesson[] = [];
  for (const [position, lesson] of input.lessons.entries()) {
    if (seen.has(lesson.id)) return err(new DuplicateLessonError(lesson.id));
    seen.add(lesson.id);
    const content = validateBoundedText(lesson.content, { label: "Lesson", max: 4000 });
    if (!content.ok) return content;
    lessons.push({ ...lesson, content: content.value, position });
  }
  return ok({
    id: input.id,
    ownerId: input.ownerId,
    projectId: input.projectId,
    context: { objective: objective.value, outcome: outcome.value, constraints },
    lessons,
    status: "DRAFT",
    createdAt: input.now,
    approvedAt: null,
    approvedBy: null,
    lockVersion: 1,
  });
}
export function approveRetrospective(
  value: Retrospective,
  input: { approvedBy: OwnerId; now: Date },
): Result<Retrospective, DomainError> {
  if (value.status === "APPROVED") return err(new RetrospectiveAlreadyApprovedError());
  if (input.now < value.createdAt)
    return err(new InvalidValueError("Approval time cannot precede creation"));
  return ok({ ...value, status: "APPROVED", approvedBy: input.approvedBy, approvedAt: input.now });
}
