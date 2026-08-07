import { DomainError } from "../shared";
export class EmptyRetrospectiveError extends DomainError {
  constructor() {
    super("VALIDATION", "A retrospective must contain at least one lesson");
  }
}
export class DuplicateLessonError extends DomainError {
  constructor(id: string) {
    super("CONFLICT", "A retrospective cannot contain duplicate lessons", {
      context: { lessonId: id },
    });
  }
}
export class RetrospectiveAlreadyApprovedError extends DomainError {
  constructor() {
    super("CONFLICT", "The retrospective is already approved");
  }
}
