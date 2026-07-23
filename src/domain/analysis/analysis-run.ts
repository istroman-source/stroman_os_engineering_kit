import { err, ok, type Result } from "@/lib/result";
import type { OwnerId, ProjectId } from "@/domain/project";
import {
  type DomainError,
  InvalidStateTransitionError,
  InvalidValueError,
  validateBoundedText,
} from "@/domain/shared";
import type { AnalysisRunId } from "./ids";

export type AnalysisRunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

/**
 * A project-scoped execution of editorial analysis. The monotonically increasing
 * version preserves prior runs instead of overwriting their outputs.
 */
export interface AnalysisRun {
  readonly id: AnalysisRunId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly version: number;
  readonly status: AnalysisRunStatus;
  readonly failureReason: string | null;
  readonly createdAt: Date;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
}

export interface CreateAnalysisRunInput {
  readonly id: AnalysisRunId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly version: number;
  readonly now: Date;
}

export interface RehydrateAnalysisRunInput extends CreateAnalysisRunInput {
  readonly status: AnalysisRunStatus;
  readonly failureReason: string | null;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
}

export function rehydrateAnalysisRun(
  input: RehydrateAnalysisRunInput,
): Result<AnalysisRun, DomainError> {
  const created = createAnalysisRun(input);
  if (!created.ok) return created;
  const validShape =
    (input.status === "PENDING" &&
      input.startedAt === null &&
      input.completedAt === null &&
      input.failureReason === null) ||
    (input.status === "RUNNING" &&
      input.startedAt !== null &&
      input.completedAt === null &&
      input.failureReason === null) ||
    (input.status === "COMPLETED" &&
      input.startedAt !== null &&
      input.completedAt !== null &&
      input.failureReason === null) ||
    (input.status === "FAILED" &&
      input.startedAt !== null &&
      input.completedAt !== null &&
      input.failureReason !== null);
  if (!validShape) return err(new InvalidValueError("Invalid analysis run lifecycle state"));
  return ok({
    ...created.value,
    status: input.status,
    failureReason: input.failureReason,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
  });
}

export function createAnalysisRun(input: CreateAnalysisRunInput): Result<AnalysisRun, DomainError> {
  if (!Number.isSafeInteger(input.version) || input.version < 1) {
    return err(new InvalidValueError("Analysis run version must be a positive integer"));
  }
  return ok({
    id: input.id,
    ownerId: input.ownerId,
    projectId: input.projectId,
    version: input.version,
    status: "PENDING",
    failureReason: null,
    createdAt: input.now,
    startedAt: null,
    completedAt: null,
  });
}

export function startAnalysisRun(run: AnalysisRun, now: Date): Result<AnalysisRun, DomainError> {
  if (run.status !== "PENDING") {
    return err(new InvalidStateTransitionError("AnalysisRun", run.status, "RUNNING"));
  }
  return ok({ ...run, status: "RUNNING", startedAt: now });
}

export function completeAnalysisRun(run: AnalysisRun, now: Date): Result<AnalysisRun, DomainError> {
  if (run.status !== "RUNNING") {
    return err(new InvalidStateTransitionError("AnalysisRun", run.status, "COMPLETED"));
  }
  return ok({ ...run, status: "COMPLETED", completedAt: now });
}

export function failAnalysisRun(
  run: AnalysisRun,
  reason: string,
  now: Date,
): Result<AnalysisRun, DomainError> {
  if (run.status !== "RUNNING") {
    return err(new InvalidStateTransitionError("AnalysisRun", run.status, "FAILED"));
  }
  const validated = validateBoundedText(reason, { label: "Analysis failure reason", max: 1000 });
  if (!validated.ok) return validated;
  return ok({
    ...run,
    status: "FAILED",
    failureReason: validated.value,
    completedAt: now,
  });
}
