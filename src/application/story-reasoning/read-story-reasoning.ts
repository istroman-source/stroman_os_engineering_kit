import { err, ok, type Result } from "@/lib/result";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import type {
  StoryAngleId,
  StoryAngleRepository,
  StoryCritiqueRepository,
  StoryEvidenceRepository,
} from "@/domain/story-reasoning";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { loadOwnedStoryAngle } from "./story-angle-access";
import {
  type StoryAngleDetailView,
  type StoryAngleView,
  type StoryCritiqueView,
  type StoryEvidenceView,
  toStoryAngleView,
  toStoryCritiqueView,
  toStoryEvidenceView,
} from "./story-reasoning-view";

export interface ListStoryAnglesDeps {
  readonly projects: ProjectRepository;
  readonly storyAngles: StoryAngleRepository;
}

export interface ListStoryAnglesInput {
  readonly actorId: OwnerId;
  readonly projectId: ProjectId;
}

export type ListStoryAnglesResult = Result<
  readonly StoryAngleView[],
  NotFoundError | NotAuthorizedError | RepositoryError
>;

/** List a project's story angles. The actor must own the project. */
export async function listStoryAnglesForProject(
  deps: ListStoryAnglesDeps,
  input: ListStoryAnglesInput,
): Promise<ListStoryAnglesResult> {
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  const project = projectLoad.value;
  if (!project) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(input.actorId, project.ownerId, "storyAngle.list");
  if (!authorized.ok) return authorized;

  const angles = await attempt("storyAngle.listByProject", () =>
    deps.storyAngles.listByProject(input.projectId),
  );
  if (!angles.ok) return angles;
  return ok(angles.value.map(toStoryAngleView));
}

export interface StoryAngleDetailDeps {
  readonly storyAngles: StoryAngleRepository;
  readonly storyEvidence: StoryEvidenceRepository;
  readonly storyCritiques: StoryCritiqueRepository;
}

export interface StoryAngleDetailInput {
  readonly actorId: OwnerId;
  readonly storyAngleId: StoryAngleId;
}

export type StoryAngleDetailResult = Result<
  StoryAngleDetailView,
  NotFoundError | NotAuthorizedError | RepositoryError
>;

/** Load an owned angle together with its cited evidence and scored critiques. */
export async function getStoryAngleDetail(
  deps: StoryAngleDetailDeps,
  input: StoryAngleDetailInput,
): Promise<StoryAngleDetailResult> {
  const angle = await loadOwnedStoryAngle(
    deps.storyAngles,
    input.actorId,
    input.storyAngleId,
    "storyAngle.read",
  );
  if (!angle.ok) return angle;

  const evidence = await attempt("storyEvidence.listByAngle", () =>
    deps.storyEvidence.listByAngle(angle.value.id),
  );
  if (!evidence.ok) return evidence;
  const critiques = await attempt("storyCritique.listByAngle", () =>
    deps.storyCritiques.listByAngle(angle.value.id),
  );
  if (!critiques.ok) return critiques;

  return ok({
    angle: toStoryAngleView(angle.value),
    evidence: evidence.value.map(toStoryEvidenceView),
    critiques: critiques.value.map(toStoryCritiqueView),
  });
}

export interface ListEvidenceDeps {
  readonly storyAngles: StoryAngleRepository;
  readonly storyEvidence: StoryEvidenceRepository;
}

/** List an owned angle's evidence. */
export async function listEvidenceForAngle(
  deps: ListEvidenceDeps,
  input: StoryAngleDetailInput,
): Promise<
  Result<readonly StoryEvidenceView[], NotFoundError | NotAuthorizedError | RepositoryError>
> {
  const angle = await loadOwnedStoryAngle(
    deps.storyAngles,
    input.actorId,
    input.storyAngleId,
    "storyEvidence.list",
  );
  if (!angle.ok) return angle;
  const evidence = await attempt("storyEvidence.listByAngle", () =>
    deps.storyEvidence.listByAngle(angle.value.id),
  );
  if (!evidence.ok) return evidence;
  return ok(evidence.value.map(toStoryEvidenceView));
}

export interface ListCritiquesDeps {
  readonly storyAngles: StoryAngleRepository;
  readonly storyCritiques: StoryCritiqueRepository;
}

/** List an owned angle's critiques. */
export async function listCritiquesForAngle(
  deps: ListCritiquesDeps,
  input: StoryAngleDetailInput,
): Promise<
  Result<readonly StoryCritiqueView[], NotFoundError | NotAuthorizedError | RepositoryError>
> {
  const angle = await loadOwnedStoryAngle(
    deps.storyAngles,
    input.actorId,
    input.storyAngleId,
    "storyCritique.list",
  );
  if (!angle.ok) return angle;
  const critiques = await attempt("storyCritique.listByAngle", () =>
    deps.storyCritiques.listByAngle(angle.value.id),
  );
  if (!critiques.ok) return critiques;
  return ok(critiques.value.map(toStoryCritiqueView));
}
