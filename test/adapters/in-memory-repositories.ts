import { ConflictError, NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import type { ContentItem, ContentItemId, ContentRepository } from "@/domain/content";
import type { Decision, DecisionId, DecisionRepository } from "@/domain/decision";
import type {
  Evaluation,
  EvaluationId,
  EvaluationRepository,
  Rubric,
  RubricId,
  RubricRepository,
} from "@/domain/evaluation";
import type { OwnerId, Project, ProjectId, ProjectRepository } from "@/domain/project";
import type { Slug } from "@/domain/shared";

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
