import { AppError, type AppErrorOptions } from "@/lib/errors";

/**
 * Application-level failures — distinct from domain failures. These describe
 * orchestration outcomes (missing resource, unauthorized actor, storage
 * failure) without any transport or persistence detail. Delivery adapters
 * translate them later (e.g. to HTTP); this layer never does.
 */
export abstract class ApplicationError extends AppError {}

export class NotFoundError extends ApplicationError {
  readonly resource: string;
  readonly id: string;
  constructor(resource: string, id: string) {
    super("NOT_FOUND", `${resource} not found`, { context: { resource, id } });
    this.resource = resource;
    this.id = id;
  }
}

export class NotAuthorizedError extends ApplicationError {
  readonly action: string;
  constructor(action: string) {
    super("FORBIDDEN", "Actor is not permitted to perform this action", {
      context: { action },
    });
    this.action = action;
  }
}

export class SlugAlreadyExistsError extends ApplicationError {
  readonly slug: string;
  constructor(slug: string) {
    super("CONFLICT", "Content with this slug already exists", { context: { slug } });
    this.slug = slug;
  }
}

export class SelectedAngleConflictError extends ApplicationError {
  readonly projectId: string;
  constructor(projectId: string) {
    super("CONFLICT", "This project already has a selected story angle", {
      context: { projectId },
    });
    this.projectId = projectId;
  }
}

export class UnknownRubricCriterionError extends ApplicationError {
  readonly criterionId: string;
  constructor(criterionId: string) {
    super("VALIDATION", "Score refers to a criterion that is not part of the rubric", {
      context: { criterionId },
    });
    this.criterionId = criterionId;
  }
}

/**
 * A safe representation of a storage-port failure. The underlying cause is
 * captured for logging by outer layers but never serialized to callers.
 */
export class RepositoryError extends ApplicationError {
  readonly operation: string;
  constructor(operation: string, options: AppErrorOptions = {}) {
    super("UNAVAILABLE", "A storage operation failed", {
      ...options,
      context: { operation, ...(options.context ?? {}) },
    });
    this.operation = operation;
  }
}
