import { ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import type { DomainError } from "@/domain/shared";
import {
  createStoryCritique as createStoryCritiqueAggregate,
  type CriticType,
  StoryAngleId,
  type StoryAngleRepository,
  StoryCritiqueId,
  type StoryCritiqueRepository,
  type StoryRecommendation,
} from "@/domain/story-reasoning";
import { attempt } from "../shared/attempt";
import type { Clock, IdGenerator } from "../shared";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { loadOwnedStoryAngle } from "./story-angle-access";
import { type StoryCritiqueView, toStoryCritiqueView } from "./story-reasoning-view";

export interface CreateStoryCritiqueDeps {
  readonly storyAngles: StoryAngleRepository;
  readonly storyCritiques: StoryCritiqueRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

export interface CreateStoryCritiqueInput {
  readonly actorId: OwnerId;
  readonly storyAngleId: string;
  readonly criticType: CriticType;
  readonly criticId?: OwnerId | null;
  readonly evidenceStrength: number;
  readonly emotionalPotential: number;
  readonly visualPotential: number;
  readonly brandAlignment: number;
  readonly originality: number;
  readonly interviewPotential: number;
  readonly strengths: string;
  readonly weaknesses: string;
  readonly recommendation: StoryRecommendation;
  readonly rationale: string;
}

export type CreateStoryCritiqueResult = Result<
  StoryCritiqueView,
  DomainError | NotFoundError | NotAuthorizedError | RepositoryError
>;

/**
 * Record a critique of an angle. The actor must own the angle. Critiques are
 * advisory: recording one never transitions the angle (only the explicit human
 * lifecycle operations do that).
 */
export async function createStoryCritique(
  deps: CreateStoryCritiqueDeps,
  input: CreateStoryCritiqueInput,
): Promise<CreateStoryCritiqueResult> {
  const angleId = StoryAngleId.parse(input.storyAngleId);
  if (!angleId.ok) return angleId;
  const angle = await loadOwnedStoryAngle(
    deps.storyAngles,
    input.actorId,
    angleId.value,
    "storyCritique.create",
  );
  if (!angle.ok) return angle;

  const critique = createStoryCritiqueAggregate({
    id: StoryCritiqueId.unsafe(deps.ids.generate(StoryCritiqueId.prefix)),
    ownerId: input.actorId,
    storyAngleId: angleId.value,
    criticType: input.criticType,
    criticId: input.criticId ?? null,
    evidenceStrength: input.evidenceStrength,
    emotionalPotential: input.emotionalPotential,
    visualPotential: input.visualPotential,
    brandAlignment: input.brandAlignment,
    originality: input.originality,
    interviewPotential: input.interviewPotential,
    strengths: input.strengths,
    weaknesses: input.weaknesses,
    recommendation: input.recommendation,
    rationale: input.rationale,
    now: deps.clock.now(),
  });
  if (!critique.ok) return critique;

  const saved = await attempt("storyCritique.insert", () =>
    deps.storyCritiques.insert(critique.value),
  );
  if (!saved.ok) return saved;
  return ok(toStoryCritiqueView(critique.value));
}
