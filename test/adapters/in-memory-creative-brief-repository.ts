import { NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import {
  type CreativeBrief,
  type CreativeBriefRepository,
  type CreativeBriefRevision,
  snapshotCreativeBrief,
} from "@/domain/creative";
import type { ProjectId } from "@/domain/project";

/**
 * In-memory CreativeBriefRepository for tests. Faithful to the contract: one brief
 * per project; update is a lockVersion compare-and-swap (stale → conflict, missing
 * → not found). A `fail` switch exercises repository-error translation.
 */
export class InMemoryCreativeBriefRepository implements CreativeBriefRepository {
  fail = false;
  private readonly byProject = new Map<string, CreativeBrief>();
  private readonly revisions = new Map<string, CreativeBriefRevision[]>();

  private guard(): void {
    if (this.fail) throw new Error("storage failure");
  }

  async findByProject(projectId: ProjectId): Promise<CreativeBrief | null> {
    this.guard();
    return this.byProject.get(projectId) ?? null;
  }

  async insert(brief: CreativeBrief): Promise<void> {
    this.guard();
    this.byProject.set(brief.projectId, brief);
    this.revisions.set(brief.projectId, [snapshotCreativeBrief(brief, 1)]);
  }

  async update(brief: CreativeBrief): Promise<void> {
    this.guard();
    const existing = this.byProject.get(brief.projectId);
    if (!existing) throw new NotFoundError();
    if (existing.lockVersion !== brief.lockVersion) throw new OptimisticConcurrencyError();
    this.byProject.set(brief.projectId, { ...brief, lockVersion: brief.lockVersion + 1 });
    const history = this.revisions.get(brief.projectId) ?? [];
    history.push(snapshotCreativeBrief(brief, brief.lockVersion + 1));
    this.revisions.set(brief.projectId, history);
  }

  async listRevisions(projectId: ProjectId): Promise<readonly CreativeBriefRevision[]> {
    this.guard();
    return [...(this.revisions.get(projectId) ?? [])];
  }
}
