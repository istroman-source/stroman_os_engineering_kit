import { err, ok, type Result } from "@/lib/result";
import {
  InsightId,
  type InsightRepository,
  MemoryId,
  type MemoryRepository,
} from "@/domain/memory";
import type { OwnerId } from "@/domain/project";
import type { DomainError } from "@/domain/shared";
import {
  createStoryEvidence as createStoryEvidenceAggregate,
  type EvidenceRole,
  StoryAngleId,
  type StoryAngleRepository,
  StoryEvidenceId,
  type StoryEvidenceRepository,
} from "@/domain/story-reasoning";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import type { Clock, IdGenerator } from "../shared";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { loadOwnedStoryAngle } from "./story-angle-access";
import { type StoryEvidenceView, toStoryEvidenceView } from "./story-reasoning-view";

export interface CreateStoryEvidenceDeps {
  readonly storyAngles: StoryAngleRepository;
  readonly storyEvidence: StoryEvidenceRepository;
  readonly memories: MemoryRepository;
  readonly insights: InsightRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

export interface CreateStoryEvidenceInput {
  readonly actorId: OwnerId;
  readonly storyAngleId: string;
  readonly memoryId?: string | null;
  readonly insightId?: string | null;
  readonly role: EvidenceRole;
  readonly reason: string;
}

export type CreateStoryEvidenceResult = Result<
  StoryEvidenceView,
  DomainError | NotFoundError | NotAuthorizedError | RepositoryError
>;

const present = (raw: string | null | undefined): raw is string => raw != null && raw.trim() !== "";

/**
 * Attach a piece of evidence to an angle. The actor must own the angle, and the
 * cited memory-graph node (exactly one of a memory or an insight — enforced by the
 * domain) must exist AND belong to the actor. This prevents citing another owner's
 * memory graph as evidence for one's own story angle.
 */
export async function createStoryEvidence(
  deps: CreateStoryEvidenceDeps,
  input: CreateStoryEvidenceInput,
): Promise<CreateStoryEvidenceResult> {
  const angleId = StoryAngleId.parse(input.storyAngleId);
  if (!angleId.ok) return angleId;
  const angle = await loadOwnedStoryAngle(
    deps.storyAngles,
    input.actorId,
    angleId.value,
    "storyEvidence.create",
  );
  if (!angle.ok) return angle;

  let memoryId: MemoryId | null = null;
  let insightId: InsightId | null = null;

  if (present(input.memoryId)) {
    const parsed = MemoryId.parse(input.memoryId);
    if (!parsed.ok) return parsed;
    const loaded = await attempt("memory.findById", () => deps.memories.findById(parsed.value));
    if (!loaded.ok) return loaded;
    if (!loaded.value) return err(new NotFoundError("Memory", parsed.value));
    const authorized = ensureOwner(input.actorId, loaded.value.ownerId, "storyEvidence.create");
    if (!authorized.ok) return authorized;
    memoryId = parsed.value;
  }

  if (present(input.insightId)) {
    const parsed = InsightId.parse(input.insightId);
    if (!parsed.ok) return parsed;
    const loaded = await attempt("insight.findById", () => deps.insights.findById(parsed.value));
    if (!loaded.ok) return loaded;
    if (!loaded.value) return err(new NotFoundError("Insight", parsed.value));
    const authorized = ensureOwner(input.actorId, loaded.value.ownerId, "storyEvidence.create");
    if (!authorized.ok) return authorized;
    insightId = parsed.value;
  }

  // The domain enforces the exactly-one-reference rule; the ownership checks above
  // only run for whichever reference was supplied.
  const evidence = createStoryEvidenceAggregate({
    id: StoryEvidenceId.unsafe(deps.ids.generate(StoryEvidenceId.prefix)),
    ownerId: input.actorId,
    storyAngleId: angleId.value,
    memoryId,
    insightId,
    role: input.role,
    reason: input.reason,
    now: deps.clock.now(),
  });
  if (!evidence.ok) return evidence;

  const saved = await attempt("storyEvidence.insert", () =>
    deps.storyEvidence.insert(evidence.value),
  );
  if (!saved.ok) return saved;
  return ok(toStoryEvidenceView(evidence.value));
}
