import { err, ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import {
  defineStateMachine,
  type DomainError,
  InvalidStateTransitionError,
  InvalidValueError,
  validateBoundedText,
} from "@/domain/shared";
import type { AcquisitionRunId, KnowledgeSourceId } from "./ids";

/**
 * Lifecycle of an acquisition run (an extraction execution over a source's
 * documents): PENDING → RUNNING → one terminal outcome. PARTIALLY_SUCCEEDED
 * distinguishes a run where some documents failed from a clean SUCCEEDED.
 */
export type AcquisitionRunStatus =
  "PENDING" | "RUNNING" | "SUCCEEDED" | "PARTIALLY_SUCCEEDED" | "FAILED";

/** Terminal outcomes reachable from RUNNING via completeRun. */
export type AcquisitionRunOutcome = "SUCCEEDED" | "PARTIALLY_SUCCEEDED" | "FAILED";
const OUTCOMES: readonly AcquisitionRunOutcome[] = ["SUCCEEDED", "PARTIALLY_SUCCEEDED", "FAILED"];

export const acquisitionRunLifecycle = defineStateMachine<AcquisitionRunStatus>({
  PENDING: ["RUNNING", "FAILED"],
  RUNNING: ["SUCCEEDED", "PARTIALLY_SUCCEEDED", "FAILED"],
  SUCCEEDED: [],
  PARTIALLY_SUCCEEDED: [],
  FAILED: [],
});

/** Counts summarizing what a completed run did. */
export interface RunSummary {
  readonly documentsProcessed: number;
  readonly observationsCreated: number;
  readonly failureCount: number;
}

export interface RunSummaryInput {
  readonly documentsProcessed: number;
  readonly observationsCreated: number;
  readonly failureCount: number;
}

export function makeRunSummary(input: RunSummaryInput): Result<RunSummary, InvalidValueError> {
  for (const [label, value] of [
    ["documentsProcessed", input.documentsProcessed],
    ["observationsCreated", input.observationsCreated],
    ["failureCount", input.failureCount],
  ] as const) {
    if (!Number.isInteger(value) || value < 0) {
      return err(new InvalidValueError(`${label} must be a non-negative integer`));
    }
  }
  return ok({
    documentsProcessed: input.documentsProcessed,
    observationsCreated: input.observationsCreated,
    failureCount: input.failureCount,
  });
}

/**
 * An extraction execution over a knowledge source's documents. `extractor` and
 * `extractorVersion` record which pipeline produced its observations, so pipelines
 * can evolve while provenance is preserved — without hardcoding any AI vendor.
 */
export interface AcquisitionRun {
  readonly id: AcquisitionRunId;
  readonly ownerId: OwnerId;
  readonly knowledgeSourceId: KnowledgeSourceId;
  readonly extractor: string;
  readonly extractorVersion: string;
  readonly status: AcquisitionRunStatus;
  readonly startedAt: Date | null;
  readonly finishedAt: Date | null;
  readonly summary: RunSummary | null;
  readonly createdAt: Date;
  readonly lockVersion: number;
}

export interface CreateAcquisitionRunInput {
  readonly id: AcquisitionRunId;
  readonly ownerId: OwnerId;
  readonly knowledgeSourceId: KnowledgeSourceId;
  readonly extractor: string;
  readonly extractorVersion: string;
  readonly now: Date;
}

export function createAcquisitionRun(
  input: CreateAcquisitionRunInput,
): Result<AcquisitionRun, DomainError> {
  const extractor = validateBoundedText(input.extractor, { label: "Extractor", max: 120 });
  if (!extractor.ok) return extractor;
  const extractorVersion = validateBoundedText(input.extractorVersion, {
    label: "Extractor version",
    max: 60,
  });
  if (!extractorVersion.ok) return extractorVersion;

  return ok({
    id: input.id,
    ownerId: input.ownerId,
    knowledgeSourceId: input.knowledgeSourceId,
    extractor: extractor.value,
    extractorVersion: extractorVersion.value,
    status: "PENDING",
    startedAt: null,
    finishedAt: null,
    summary: null,
    createdAt: input.now,
    lockVersion: 1,
  });
}

function assertFrom(
  run: AcquisitionRun,
  allowedFrom: readonly AcquisitionRunStatus[],
  to: AcquisitionRunStatus,
): Result<true, InvalidStateTransitionError> {
  if (!allowedFrom.includes(run.status)) {
    return err(new InvalidStateTransitionError("AcquisitionRun", run.status, to));
  }
  const asserted = acquisitionRunLifecycle.assert("AcquisitionRun", run.status, to);
  if (!asserted.ok) return asserted;
  return ok(true);
}

/** Begin a pending run. */
export function startRun(run: AcquisitionRun, now: Date): Result<AcquisitionRun, DomainError> {
  const asserted = assertFrom(run, ["PENDING"], "RUNNING");
  if (!asserted.ok) return asserted;
  return ok({ ...run, status: "RUNNING", startedAt: now, lockVersion: run.lockVersion + 1 });
}

export interface CompleteRunInput {
  readonly status: AcquisitionRunOutcome;
  readonly summary: RunSummaryInput;
  readonly now: Date;
}

/** Complete a running run with a terminal outcome and its summary counts. */
export function completeRun(
  run: AcquisitionRun,
  input: CompleteRunInput,
): Result<AcquisitionRun, DomainError> {
  if (!OUTCOMES.includes(input.status)) {
    return err(new InvalidValueError(`Invalid run outcome: "${input.status}"`));
  }
  const asserted = assertFrom(run, ["RUNNING"], input.status);
  if (!asserted.ok) return asserted;
  const summary = makeRunSummary(input.summary);
  if (!summary.ok) return summary;
  return ok({
    ...run,
    status: input.status,
    summary: summary.value,
    finishedAt: input.now,
    lockVersion: run.lockVersion + 1,
  });
}

/** Fail a run that never started or is running (e.g. an execution error). */
export function failRun(run: AcquisitionRun, now: Date): Result<AcquisitionRun, DomainError> {
  const asserted = assertFrom(run, ["PENDING", "RUNNING"], "FAILED");
  if (!asserted.ok) return asserted;
  return ok({ ...run, status: "FAILED", finishedAt: now, lockVersion: run.lockVersion + 1 });
}
