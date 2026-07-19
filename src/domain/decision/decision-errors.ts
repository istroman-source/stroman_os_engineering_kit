import { DomainError } from "../shared";

export class InsufficientOptionsError extends DomainError {
  constructor() {
    super("VALIDATION", "A decision must offer at least two options");
  }
}

export class DuplicateOptionError extends DomainError {
  readonly optionId: string;
  constructor(optionId: string) {
    super("CONFLICT", "Duplicate decision option id", { context: { optionId } });
    this.optionId = optionId;
  }
}

export class UnknownOptionError extends DomainError {
  readonly optionId: string;
  constructor(optionId: string) {
    super("VALIDATION", "Referenced option does not belong to this decision", {
      context: { optionId },
    });
    this.optionId = optionId;
  }
}

export class DecisionAlreadyDecidedError extends DomainError {
  constructor() {
    super("CONFLICT", "This decision has already been decided");
  }
}
