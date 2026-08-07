import { OptimisticConcurrencyError } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";
import {
  approveRetrospective as approveAggregate,
  createRetrospective as createAggregate,
  LessonId,
  RetrospectiveId,
  type LessonCategory,
  type Retrospective,
  type RetrospectiveRepository,
} from "@/domain/learning";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import type { DomainError } from "@/domain/shared";
import { attempt, attemptUpdate } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import type { Clock } from "../shared/clock";
import { NotAuthorizedError, NotFoundError, RepositoryError } from "../shared/errors";
import type { IdGenerator } from "../shared/id-generator";

export type RetrospectiveView = Omit<Retrospective, "ownerId">;
const view = (value: Retrospective): RetrospectiveView => ({
  id: value.id,
  projectId: value.projectId,
  context: value.context,
  lessons: value.lessons,
  status: value.status,
  createdAt: value.createdAt,
  approvedAt: value.approvedAt,
  approvedBy: value.approvedBy,
  lockVersion: value.lockVersion,
});
export interface LearningDeps {
  projects: ProjectRepository;
  retrospectives: RetrospectiveRepository;
  ids: IdGenerator;
  clock: Clock;
}
export interface LessonInput {
  category: LessonCategory;
  content: string;
}
type CommonFailure = NotFoundError | NotAuthorizedError | RepositoryError;

async function ownedProject(
  deps: LearningDeps,
  actorId: OwnerId,
  projectId: ProjectId,
  action: string,
): Promise<Result<void, CommonFailure>> {
  const loaded = await attempt("project.findById", () => deps.projects.findById(projectId));
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("Project", projectId));
  const authorized = ensureOwner(actorId, loaded.value.ownerId, action);
  return authorized.ok ? ok(undefined) : authorized;
}

export async function createRetrospective(
  deps: LearningDeps,
  input: {
    actorId: OwnerId;
    projectId: ProjectId;
    objective: string;
    outcome: string;
    constraints?: string | null;
    lessons: readonly LessonInput[];
  },
): Promise<Result<RetrospectiveView, DomainError | CommonFailure>> {
  const owned = await ownedProject(deps, input.actorId, input.projectId, "retrospective.create");
  if (!owned.ok) return owned;
  const aggregate = createAggregate({
    id: RetrospectiveId.unsafe(deps.ids.generate(RetrospectiveId.prefix)),
    ownerId: input.actorId,
    projectId: input.projectId,
    context: {
      objective: input.objective,
      outcome: input.outcome,
      constraints: input.constraints ?? null,
    },
    lessons: input.lessons.map((lesson) => ({
      id: LessonId.unsafe(deps.ids.generate(LessonId.prefix)),
      ...lesson,
    })),
    now: deps.clock.now(),
  });
  if (!aggregate.ok) return aggregate;
  const saved = await attempt("retrospective.insert", () =>
    deps.retrospectives.insert(aggregate.value),
  );
  if (!saved.ok) return saved;
  return ok(view(aggregate.value));
}

async function loadOwned(
  deps: LearningDeps,
  actorId: OwnerId,
  id: RetrospectiveId,
  action: string,
): Promise<Result<Retrospective, CommonFailure>> {
  const loaded = await attempt("retrospective.findById", () => deps.retrospectives.findById(id));
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("Retrospective", id));
  const owned = await ownedProject(deps, actorId, loaded.value.projectId, action);
  return owned.ok ? ok(loaded.value) : owned;
}

export async function approveRetrospective(
  deps: LearningDeps,
  input: { actorId: OwnerId; retrospectiveId: RetrospectiveId; expectedVersion: number },
): Promise<Result<RetrospectiveView, DomainError | CommonFailure | OptimisticConcurrencyError>> {
  const loaded = await loadOwned(
    deps,
    input.actorId,
    input.retrospectiveId,
    "retrospective.approve",
  );
  if (!loaded.ok) return loaded;
  if (loaded.value.lockVersion !== input.expectedVersion)
    return err(new OptimisticConcurrencyError());
  const approved = approveAggregate(loaded.value, {
    approvedBy: input.actorId,
    now: deps.clock.now(),
  });
  if (!approved.ok) return approved;
  const saved = await attemptUpdate("retrospective.update", () =>
    deps.retrospectives.update(approved.value),
  );
  if (!saved.ok) return saved;
  return ok(view({ ...approved.value, lockVersion: approved.value.lockVersion + 1 }));
}

export async function getRetrospective(
  deps: LearningDeps,
  input: { actorId: OwnerId; retrospectiveId: RetrospectiveId },
): Promise<Result<RetrospectiveView, CommonFailure>> {
  const loaded = await loadOwned(deps, input.actorId, input.retrospectiveId, "retrospective.get");
  return loaded.ok ? ok(view(loaded.value)) : loaded;
}

export async function listRetrospectives(
  deps: LearningDeps,
  input: { actorId: OwnerId; projectId: ProjectId },
): Promise<Result<readonly RetrospectiveView[], CommonFailure>> {
  const owned = await ownedProject(deps, input.actorId, input.projectId, "retrospective.list");
  if (!owned.ok) return owned;
  const loaded = await attempt("retrospective.listByProject", () =>
    deps.retrospectives.listByProject(input.projectId),
  );
  return loaded.ok ? ok(loaded.value.map(view)) : loaded;
}
