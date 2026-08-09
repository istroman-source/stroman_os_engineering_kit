import { DomainError } from "@/domain/shared";

export class CreativeAuthorityError extends DomainError {
  constructor(message: string) {
    super("FORBIDDEN", message);
  }
}
export class GroundingReferenceError extends DomainError {
  constructor() {
    super("VALIDATION", "Grounding must contain exactly one reference matching its kind");
  }
}
export class CreativeAlignmentError extends DomainError {
  constructor(message: string) {
    super("CONFLICT", message);
  }
}
export class SelfRevisionError extends DomainError {
  constructor() {
    super("VALIDATION", "A creative direction cannot revise itself");
  }
}
export class EmptyProjectPlanError extends DomainError {
  constructor() {
    super("VALIDATION", "A project plan must contain at least one segment");
  }
}
export class InvalidPlanOrderingError extends DomainError {
  constructor(message: string) {
    super("VALIDATION", message);
  }
}
