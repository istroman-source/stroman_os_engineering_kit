import { NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import type { CreativeBrief, CreativeBriefRepository } from "@/domain/creative";
import type { ProjectId } from "@/domain/project";

/**
 * In-memory CreativeBriefRepository for tests. Faithful to the contract: one brief
 * per project; update is a lockVersion compare-and-swap (stale → conflict, missing
 * → not found). A `fail` switch exercises repository-error translation.
 */
export class InMemoryCreativeBriefRepository implements CreativeBriefRepository {
  fail = false;
  private readonly byProject = new Map<string, CreativeBrief>();

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
  }

  async update(brief: CreativeBrief): Promise<void> {
    this.guard();
    const existing = this.byProject.get(brief.projectId);
    if (!existing) throw new NotFoundError();
    if (existing.lockVersion !== brief.lockVersion) throw new OptimisticConcurrencyError();
    this.byProject.set(brief.projectId, { ...brief, lockVersion: brief.lockVersion + 1 });
  }
}
