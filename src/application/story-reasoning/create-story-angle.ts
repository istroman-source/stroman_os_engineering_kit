import { err, ok, type Result } from "@/lib/result";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import type { DomainError } from "@/domain/shared";
import {
  createStoryAngle as createStoryAngleAggregate,
  StoryAngleId,
  type StoryAngleRepository,
} from "@/domain/story-reasoning";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import type { Clock, IdGenerator } from "../shared";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { type StoryAngleView, toStoryAngleView } from "./story-reasoning-view";

export interface CreateStoryAngleDeps {
  readonly projects: ProjectRepository;
  readonly storyAngles: StoryAngleRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

export interface CreateStoryAngleInput {
  readonly actorId: OwnerId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly theme: string;
  readonly premise: string;
  readonly audiencePromise: string;
  readonly centralQuestion: string;
}

export type CreateStoryAngleResult = Result<
  StoryAngleView,
  DomainError | NotFoundError | NotAuthorizedError | RepositoryError
>;

/**
 * Author a new DRAFT story angle under a project. The actor must own the project;
 * the created angle is owner-scoped to that same actor.
 */
export async function createStoryAngle(
  deps: CreateStoryAngleDeps,
  input: CreateStoryAngleInput,
): Promise<CreateStoryAngleResult> {
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  const project = projectLoad.value;
  if (!project) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(input.actorId, project.ownerId, "storyAngle.create");
  if (!authorized.ok) return authorized;

  const angle = createStoryAngleAggregate({
    id: StoryAngleId.unsafe(deps.ids.generate(StoryAngleId.prefix)),
    ownerId: input.actorId,
    projectId: input.projectId,
    title: input.title,
    theme: input.theme,
    premise: input.premise,
    audiencePromise: input.audiencePromise,
    centralQuestion: input.centralQuestion,
    now: deps.clock.now(),
  });
  if (!angle.ok) return angle;

  const saved = await attempt("storyAngle.insert", () => deps.storyAngles.insert(angle.value));
  if (!saved.ok) return saved;
  return ok(toStoryAngleView(angle.value));
}
