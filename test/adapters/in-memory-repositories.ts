import { ConflictError, NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import type { ContentItem, ContentItemId, ContentRepository } from "@/domain/content";
import type { Decision, DecisionId, DecisionRepository } from "@/domain/decision";
import type {
  AcquisitionRun,
  AcquisitionRunId,
  AcquisitionRunRepository,
  KnowledgeObservation,
  KnowledgeObservationId,
  KnowledgeObservationRepository,
  KnowledgeReview,
  KnowledgeReviewId,
  KnowledgeReviewRepository,
  KnowledgeSource,
  KnowledgeSourceId,
  KnowledgeSourceRepository,
  SourceDocument,
  SourceDocumentId,
  SourceDocumentRepository,
} from "@/domain/knowledge-acquisition";
import type {
  Evaluation,
  EvaluationId,
  EvaluationRepository,
  Rubric,
  RubricId,
  RubricRepository,
} from "@/domain/evaluation";
import type {
  EntityId,
  Insight,
  InsightId,
  InsightRepository,
  MemoryId,
  MemoryRecord,
  MemoryRepository,
  SourceId,
} from "@/domain/memory";
import type { OwnerId, Project, ProjectId, ProjectRepository } from "@/domain/project";
import type { Slug } from "@/domain/shared";
import type {
  StoryAngle,
  StoryAngleId,
  StoryAngleRepository,
  StoryCritique,
  StoryCritiqueId,
  StoryCritiqueRepository,
  StoryEvidence,
  StoryEvidenceId,
  StoryEvidenceRepository,
} from "@/domain/story-reasoning";

/**
 * In-memory repository implementations for tests only. They satisfy the real
 * domain contracts and model behavior faithfully — insert rejects duplicates,
 * update rejects missing rows and stale writes (optimistic concurrency) — with a
 * `fail` switch to exercise repository-failure translation. NOT production code.
 */

class FailableStore {
  fail = false;
  protected guard(): void {
    if (this.fail) throw new Error("storage failure");
  }
}

interface Versioned {
  readonly id: string;
  readonly lockVersion: number;
}

function insertInto<T extends { id: string }>(store: Map<string, T>, entity: T): void {
  if (store.has(entity.id)) throw new ConflictError("Duplicate id");
  store.set(entity.id, entity);
}

function updateInto<T extends Versioned>(store: Map<string, T>, entity: T): void {
  const existing = store.get(entity.id);
  if (!existing) throw new NotFoundError();
  if (existing.lockVersion !== entity.lockVersion) throw new OptimisticConcurrencyError();
  store.set(entity.id, { ...entity, lockVersion: entity.lockVersion + 1 });
}

export class InMemoryProjectRepository extends FailableStore implements ProjectRepository {
  private readonly store = new Map<string, Project>();

  seed(project: Project): void {
    this.store.set(project.id, project);
  }

  async findById(id: ProjectId): Promise<Project | null> {
    this.guard();
    return this.store.get(id) ?? null;
  }

  async listByOwner(ownerId: OwnerId): Promise<readonly Project[]> {
    this.guard();
    return [...this.store.values()].filter((project) => project.ownerId === ownerId);
  }

  async insert(project: Project): Promise<void> {
    this.guard();
    insertInto(this.store, project);
  }

  async update(project: Project): Promise<void> {
    this.guard();
    updateInto(this.store, project);
  }
}

export class InMemoryContentRepository extends FailableStore implements ContentRepository {
  private readonly store = new Map<string, ContentItem>();

  seed(item: ContentItem): void {
    this.store.set(item.id, item);
  }

  async findById(id: ContentItemId): Promise<ContentItem | null> {
    this.guard();
    return this.store.get(id) ?? null;
  }

  async findBySlug(slug: Slug): Promise<ContentItem | null> {
    this.guard();
    return [...this.store.values()].find((item) => item.slug === slug) ?? null;
  }

  async existsBySlug(slug: Slug): Promise<boolean> {
    this.guard();
    return [...this.store.values()].some((item) => item.slug === slug);
  }

  async insert(item: ContentItem): Promise<void> {
    this.guard();
    if ([...this.store.values()].some((existing) => existing.slug === item.slug)) {
      throw new ConflictError("Duplicate slug");
    }
    insertInto(this.store, item);
  }

  async update(item: ContentItem): Promise<void> {
    this.guard();
    updateInto(this.store, item);
  }
}

export class InMemoryRubricRepository extends FailableStore implements RubricRepository {
  private readonly store = new Map<string, Rubric>();

  seed(rubric: Rubric): void {
    this.store.set(rubric.id, rubric);
  }

  async findById(id: RubricId): Promise<Rubric | null> {
    this.guard();
    return this.store.get(id) ?? null;
  }

  async insert(rubric: Rubric): Promise<void> {
    this.guard();
    insertInto(this.store, rubric);
  }
}

export class InMemoryEvaluationRepository extends FailableStore implements EvaluationRepository {
  private readonly store = new Map<string, Evaluation>();

  async findById(id: EvaluationId): Promise<Evaluation | null> {
    this.guard();
    return this.store.get(id) ?? null;
  }

  async listByProject(projectId: ProjectId): Promise<readonly Evaluation[]> {
    this.guard();
    return [...this.store.values()].filter((evaluation) => evaluation.projectId === projectId);
  }

  async insert(evaluation: Evaluation): Promise<void> {
    this.guard();
    insertInto(this.store, evaluation);
  }
}

export class InMemoryDecisionRepository extends FailableStore implements DecisionRepository {
  private readonly store = new Map<string, Decision>();

  seed(decision: Decision): void {
    this.store.set(decision.id, decision);
  }

  async findById(id: DecisionId): Promise<Decision | null> {
    this.guard();
    return this.store.get(id) ?? null;
  }

  async listByProject(projectId: ProjectId): Promise<readonly Decision[]> {
    this.guard();
    return [...this.store.values()].filter((decision) => decision.projectId === projectId);
  }

  async insert(decision: Decision): Promise<void> {
    this.guard();
    insertInto(this.store, decision);
  }

  async update(decision: Decision): Promise<void> {
    this.guard();
    updateInto(this.store, decision);
  }
}

export class InMemoryMemoryRepository extends FailableStore implements MemoryRepository {
  private readonly store = new Map<string, MemoryRecord>();

  seed(memory: MemoryRecord): void {
    this.store.set(memory.id, memory);
  }

  async findById(id: MemoryId): Promise<MemoryRecord | null> {
    this.guard();
    return this.store.get(id) ?? null;
  }

  async listByEntity(entityId: EntityId): Promise<readonly MemoryRecord[]> {
    this.guard();
    return [...this.store.values()].filter((m) => m.entityId === entityId);
  }

  async listBySource(sourceId: SourceId): Promise<readonly MemoryRecord[]> {
    this.guard();
    return [...this.store.values()].filter((m) => m.sourceId === sourceId);
  }

  async insert(memory: MemoryRecord): Promise<void> {
    this.guard();
    insertInto(this.store, memory);
  }

  async delete(id: MemoryId): Promise<void> {
    this.guard();
    this.store.delete(id);
  }
}

export class InMemoryInsightRepository extends FailableStore implements InsightRepository {
  private readonly store = new Map<string, Insight>();

  seed(insight: Insight): void {
    this.store.set(insight.id, insight);
  }

  async findById(id: InsightId): Promise<Insight | null> {
    this.guard();
    return this.store.get(id) ?? null;
  }

  async listByMemory(memoryId: MemoryId): Promise<readonly Insight[]> {
    return this.listByMemoryIds([memoryId]);
  }

  async listByMemoryIds(memoryIds: readonly MemoryId[]): Promise<readonly Insight[]> {
    this.guard();
    const wanted = new Set<string>(memoryIds);
    return [...this.store.values()].filter((i) => i.memoryIds.some((m) => wanted.has(m)));
  }

  async insert(insight: Insight): Promise<void> {
    this.guard();
    insertInto(this.store, insight);
  }

  async delete(id: InsightId): Promise<void> {
    this.guard();
    this.store.delete(id);
  }
}

export class InMemoryStoryAngleRepository extends FailableStore implements StoryAngleRepository {
  private readonly store = new Map<string, StoryAngle>();

  seed(angle: StoryAngle): void {
    this.store.set(angle.id, angle);
  }

  async findById(id: StoryAngleId): Promise<StoryAngle | null> {
    this.guard();
    return this.store.get(id) ?? null;
  }

  async listByProject(projectId: ProjectId): Promise<readonly StoryAngle[]> {
    this.guard();
    return [...this.store.values()].filter((angle) => angle.projectId === projectId);
  }

  async listByOwner(ownerId: OwnerId): Promise<readonly StoryAngle[]> {
    this.guard();
    return [...this.store.values()].filter((angle) => angle.ownerId === ownerId);
  }

  async findSelectedByProject(projectId: ProjectId): Promise<StoryAngle | null> {
    this.guard();
    return (
      [...this.store.values()].find(
        (angle) => angle.projectId === projectId && angle.status === "SELECTED",
      ) ?? null
    );
  }

  async insert(angle: StoryAngle): Promise<void> {
    this.guard();
    insertInto(this.store, angle);
  }

  /**
   * Mirrors the Prisma adapter: the domain transition already incremented
   * `lockVersion`, so the compare-and-swap matches the stored (previous) version
   * against `incoming - 1`. Also enforces the partial-unique "one SELECTED angle
   * per project" invariant by throwing a ConflictError, as the DB index would.
   */
  async update(angle: StoryAngle): Promise<void> {
    this.guard();
    const existing = this.store.get(angle.id);
    if (!existing) throw new NotFoundError();
    if (existing.lockVersion !== angle.lockVersion - 1) throw new OptimisticConcurrencyError();
    if (
      angle.status === "SELECTED" &&
      [...this.store.values()].some(
        (other) =>
          other.id !== angle.id &&
          other.projectId === angle.projectId &&
          other.status === "SELECTED",
      )
    ) {
      throw new ConflictError("A unique constraint was violated");
    }
    this.store.set(angle.id, angle);
  }
}

export class InMemoryStoryEvidenceRepository
  extends FailableStore
  implements StoryEvidenceRepository
{
  private readonly store = new Map<string, StoryEvidence>();

  async findById(id: StoryEvidenceId): Promise<StoryEvidence | null> {
    this.guard();
    return this.store.get(id) ?? null;
  }

  async listByAngle(storyAngleId: StoryAngleId): Promise<readonly StoryEvidence[]> {
    this.guard();
    return [...this.store.values()].filter((e) => e.storyAngleId === storyAngleId);
  }

  async insert(evidence: StoryEvidence): Promise<void> {
    this.guard();
    insertInto(this.store, evidence);
  }

  async delete(id: StoryEvidenceId): Promise<void> {
    this.guard();
    this.store.delete(id);
  }
}

export class InMemoryStoryCritiqueRepository
  extends FailableStore
  implements StoryCritiqueRepository
{
  private readonly store = new Map<string, StoryCritique>();

  async findById(id: StoryCritiqueId): Promise<StoryCritique | null> {
    this.guard();
    return this.store.get(id) ?? null;
  }

  async listByAngle(storyAngleId: StoryAngleId): Promise<readonly StoryCritique[]> {
    this.guard();
    return [...this.store.values()].filter((c) => c.storyAngleId === storyAngleId);
  }

  async insert(critique: StoryCritique): Promise<void> {
    this.guard();
    insertInto(this.store, critique);
  }

  async delete(id: StoryCritiqueId): Promise<void> {
    this.guard();
    this.store.delete(id);
  }
}

export class InMemoryKnowledgeSourceRepository
  extends FailableStore
  implements KnowledgeSourceRepository
{
  private readonly store = new Map<string, KnowledgeSource>();
  seed(v: KnowledgeSource) {
    this.store.set(v.id, v);
  }
  async insert(v: KnowledgeSource) {
    this.guard();
    insertInto(this.store, v);
  }
  async findById(id: KnowledgeSourceId) {
    this.guard();
    return this.store.get(id) ?? null;
  }
  async listByOwner(ownerId: OwnerId) {
    this.guard();
    return [...this.store.values()].filter((v) => v.ownerId === ownerId);
  }
  async update(v: KnowledgeSource) {
    this.guard();
    const old = this.store.get(v.id);
    if (!old) throw new NotFoundError();
    if (old.lockVersion !== v.lockVersion - 1) throw new OptimisticConcurrencyError();
    this.store.set(v.id, v);
  }
}

export class InMemorySourceDocumentRepository
  extends FailableStore
  implements SourceDocumentRepository
{
  private readonly store = new Map<string, SourceDocument>();
  seed(v: SourceDocument) {
    this.store.set(v.id, v);
  }
  async insert(v: SourceDocument) {
    this.guard();
    if (
      [...this.store.values()].some(
        (d) => d.knowledgeSourceId === v.knowledgeSourceId && d.contentHash === v.contentHash,
      )
    )
      throw new ConflictError("Duplicate source document");
    insertInto(this.store, v);
  }
  async findById(id: SourceDocumentId) {
    this.guard();
    return this.store.get(id) ?? null;
  }
  async listBySource(id: KnowledgeSourceId) {
    this.guard();
    return [...this.store.values()].filter((v) => v.knowledgeSourceId === id);
  }
  async findBySourceAndHash(id: KnowledgeSourceId, hash: string) {
    this.guard();
    return (
      [...this.store.values()].find((v) => v.knowledgeSourceId === id && v.contentHash === hash) ??
      null
    );
  }
}

export class InMemoryAcquisitionRunRepository
  extends FailableStore
  implements AcquisitionRunRepository
{
  private readonly store = new Map<string, AcquisitionRun>();
  seed(v: AcquisitionRun) {
    this.store.set(v.id, v);
  }
  async insert(v: AcquisitionRun) {
    this.guard();
    insertInto(this.store, v);
  }
  async findById(id: AcquisitionRunId) {
    this.guard();
    return this.store.get(id) ?? null;
  }
  async listBySource(id: KnowledgeSourceId) {
    this.guard();
    return [...this.store.values()].filter((v) => v.knowledgeSourceId === id);
  }
  async update(v: AcquisitionRun) {
    this.guard();
    const old = this.store.get(v.id);
    if (!old) throw new NotFoundError();
    if (old.lockVersion !== v.lockVersion - 1) throw new OptimisticConcurrencyError();
    this.store.set(v.id, v);
  }
}

export class InMemoryKnowledgeObservationRepository
  extends FailableStore
  implements KnowledgeObservationRepository
{
  private readonly store = new Map<string, KnowledgeObservation>();
  constructor(private readonly reviews: InMemoryKnowledgeReviewStore) {
    super();
  }
  seed(v: KnowledgeObservation) {
    this.store.set(v.id, v);
  }
  async insert(v: KnowledgeObservation) {
    this.guard();
    insertInto(this.store, v);
  }
  async findById(id: KnowledgeObservationId) {
    this.guard();
    return this.store.get(id) ?? null;
  }
  async listByDocument(id: SourceDocumentId) {
    this.guard();
    return [...this.store.values()].filter((v) => v.evidence.sourceDocumentId === id);
  }
  async listByRun(id: AcquisitionRunId) {
    this.guard();
    return [...this.store.values()].filter((v) => v.evidence.acquisitionRunId === id);
  }
  async applyReview(v: KnowledgeObservation, review: KnowledgeReview) {
    this.guard();
    const old = this.store.get(v.id);
    if (!old) throw new NotFoundError();
    if (old.lockVersion !== v.lockVersion - 1) throw new OptimisticConcurrencyError();
    if (this.reviews.hasObservation(v.id)) throw new ConflictError("Observation already reviewed");
    this.store.set(v.id, v);
    this.reviews.set(review);
  }
}

export class InMemoryKnowledgeReviewStore {
  private readonly byId = new Map<string, KnowledgeReview>();
  private readonly byObservation = new Map<string, KnowledgeReview>();

  hasObservation(id: KnowledgeObservationId): boolean {
    return this.byObservation.has(id);
  }
  set(review: KnowledgeReview): void {
    this.byId.set(review.id, review);
    this.byObservation.set(review.knowledgeObservationId, review);
  }
  findById(id: KnowledgeReviewId): KnowledgeReview | null {
    return this.byId.get(id) ?? null;
  }
  findByObservation(id: KnowledgeObservationId): KnowledgeReview | null {
    return this.byObservation.get(id) ?? null;
  }
}

export class InMemoryKnowledgeReviewRepository
  extends FailableStore
  implements KnowledgeReviewRepository
{
  constructor(private readonly store: InMemoryKnowledgeReviewStore) {
    super();
  }
  seed(v: KnowledgeReview) {
    this.store.set(v);
  }
  async findById(id: KnowledgeReviewId) {
    this.guard();
    return this.store.findById(id);
  }
  async findByObservation(id: KnowledgeObservationId) {
    this.guard();
    return this.store.findByObservation(id);
  }
}
