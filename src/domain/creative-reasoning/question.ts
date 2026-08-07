import type { OwnerId, ProjectId } from "@/domain/project";
import {
  type DomainError,
  InvalidStateTransitionError,
  validateBoundedText,
} from "@/domain/shared";
import { err, ok, type Result } from "@/lib/result";
import { CreativeAlignmentError, CreativeAuthorityError } from "./errors";
import type {
  CreativeDirectionId,
  CreativeQuestionId,
  CreativeReasoningSessionId,
  HumanContextId,
} from "./ids";
import type { CreativeOrigin } from "./direction";

export type CreativeQuestionStatus = "OPEN" | "ANSWERED" | "DISMISSED";
export type CreativeQuestionTarget =
  | { readonly kind: "SESSION"; readonly sessionId: CreativeReasoningSessionId }
  | { readonly kind: "DIRECTION"; readonly directionId: CreativeDirectionId };
export interface CreativeQuestion {
  readonly id: CreativeQuestionId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly target: CreativeQuestionTarget;
  readonly prompt: string;
  readonly decisionImpact: string;
  readonly origin: CreativeOrigin;
  readonly status: CreativeQuestionStatus;
  readonly answeredByContextId: HumanContextId | null;
  readonly createdAt: Date;
  readonly lockVersion: number;
}
export function createCreativeQuestion(
  input: Omit<CreativeQuestion, "status" | "answeredByContextId" | "lockVersion">,
): Result<CreativeQuestion, DomainError> {
  const prompt = validateBoundedText(input.prompt, { label: "Creative question", max: 1000 });
  if (!prompt.ok) return prompt;
  const impact = validateBoundedText(input.decisionImpact, { label: "Decision impact", max: 2000 });
  if (!impact.ok) return impact;
  return ok({
    ...input,
    prompt: prompt.value,
    decisionImpact: impact.value,
    status: "OPEN",
    answeredByContextId: null,
    lockVersion: 1,
  });
}
export interface HumanContext {
  readonly id: HumanContextId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly providedBy: OwnerId;
  readonly content: string;
  readonly answersQuestionId: CreativeQuestionId | null;
  readonly createdAt: Date;
}
export function createHumanContext(input: HumanContext): Result<HumanContext, DomainError> {
  if (input.providedBy !== input.ownerId)
    return err(new CreativeAuthorityError("Human context must be attributed to the project owner"));
  const content = validateBoundedText(input.content, { label: "Human context", max: 8000 });
  return content.ok ? ok({ ...input, content: content.value }) : content;
}
export function answerCreativeQuestion(
  question: CreativeQuestion,
  context: HumanContext,
): Result<CreativeQuestion, DomainError> {
  if (question.status !== "OPEN")
    return err(new InvalidStateTransitionError("CreativeQuestion", question.status, "ANSWERED"));
  if (
    context.ownerId !== question.ownerId ||
    context.projectId !== question.projectId ||
    context.answersQuestionId !== question.id
  )
    return err(new CreativeAlignmentError("Answering context must match the creative question"));
  return ok({
    ...question,
    status: "ANSWERED",
    answeredByContextId: context.id,
    lockVersion: question.lockVersion + 1,
  });
}
export function dismissCreativeQuestion(
  question: CreativeQuestion,
): Result<CreativeQuestion, DomainError> {
  if (question.status !== "OPEN")
    return err(new InvalidStateTransitionError("CreativeQuestion", question.status, "DISMISSED"));
  return ok({ ...question, status: "DISMISSED", lockVersion: question.lockVersion + 1 });
}
