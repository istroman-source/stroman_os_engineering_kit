import { err, ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import type { StoryAngle, StoryAngleId, StoryAngleRepository } from "@/domain/story-reasoning";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";

export type LoadOwnedStoryAngleResult = Result<
  StoryAngle,
  NotFoundError | NotAuthorizedError | RepositoryError
>;

/**
 * Load a story angle and authorize the actor against its owner. Possession of an
 * id is never sufficient — the acting user must own the angle. Shared by the
 * lifecycle and read use cases so ownership is enforced identically everywhere.
 */
export async function loadOwnedStoryAngle(
  repo: StoryAngleRepository,
  actorId: OwnerId,
  id: StoryAngleId,
  action: string,
): Promise<LoadOwnedStoryAngleResult> {
  const loaded = await attempt("storyAngle.findById", () => repo.findById(id));
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("StoryAngle", id));
  const authorized = ensureOwner(actorId, loaded.value.ownerId, action);
  if (!authorized.ok) return authorized;
  return ok(loaded.value);
}
