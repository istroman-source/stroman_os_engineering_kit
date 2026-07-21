import type { PrismaClient } from "@prisma/client";
import { NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import type { OwnerId, ProjectId } from "@/domain/project";
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
import { translatePrismaError } from "../errors";
import {
  toStoryAngle,
  toStoryAngleFields,
  toStoryCritique,
  toStoryCritiqueFields,
  toStoryEvidence,
  toStoryEvidenceFields,
} from "../mappers/story-reasoning-mappers";

/**
 * PostgreSQL/Prisma adapter for the story-angle aggregate.
 * - insert: creates the angle root.
 * - update: compare-and-swap on `lockVersion`. A stale write → OptimisticConcurrency;
 *   a missing row → NotFound. The "at most one SELECTED angle per project" invariant
 *   is enforced by a partial unique index, which surfaces as a translated
 *   ConflictError when a second selection would be committed.
 */
export class PrismaStoryAngleRepository implements StoryAngleRepository {
  constructor(private readonly db: PrismaClient) {}

  async insert(angle: StoryAngle): Promise<void> {
    try {
      await this.db.storyAngle.create({ data: toStoryAngleFields(angle) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findById(id: StoryAngleId): Promise<StoryAngle | null> {
    try {
      const row = await this.db.storyAngle.findUnique({ where: { id } });
      return row ? toStoryAngle(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listByProject(projectId: ProjectId): Promise<readonly StoryAngle[]> {
    try {
      const rows = await this.db.storyAngle.findMany({
        where: { projectId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toStoryAngle);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listByOwner(ownerId: OwnerId): Promise<readonly StoryAngle[]> {
    try {
      const rows = await this.db.storyAngle.findMany({
        where: { ownerId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toStoryAngle);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findSelectedByProject(projectId: ProjectId): Promise<StoryAngle | null> {
    try {
      const row = await this.db.storyAngle.findFirst({
        where: { projectId, status: "SELECTED" },
      });
      return row ? toStoryAngle(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async update(angle: StoryAngle): Promise<void> {
    const { id, lockVersion: _drop, ...rest } = toStoryAngleFields(angle);
    void _drop;
    // The domain transition already incremented lockVersion, so the stored row
    // still holds the PREVIOUS version; the compare-and-swap matches it and writes
    // the new version.
    const nextVersion = angle.lockVersion;
    const expectedVersion = nextVersion - 1;
    let updated = false;
    try {
      const result = await this.db.storyAngle.updateMany({
        where: { id, lockVersion: expectedVersion },
        data: { ...rest, lockVersion: nextVersion },
      });
      updated = result.count > 0;
    } catch (error) {
      throw translatePrismaError(error);
    }
    if (!updated) {
      throw (await this.exists(id)) ? new OptimisticConcurrencyError() : new NotFoundError();
    }
  }

  private async exists(id: string): Promise<boolean> {
    try {
      const row = await this.db.storyAngle.findUnique({ where: { id }, select: { id: true } });
      return row !== null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}

/** Append-only adapter for story evidence (a citation into the Memory Engine). */
export class PrismaStoryEvidenceRepository implements StoryEvidenceRepository {
  constructor(private readonly db: PrismaClient) {}

  async insert(evidence: StoryEvidence): Promise<void> {
    try {
      await this.db.storyEvidence.create({ data: toStoryEvidenceFields(evidence) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findById(id: StoryEvidenceId): Promise<StoryEvidence | null> {
    try {
      const row = await this.db.storyEvidence.findUnique({ where: { id } });
      return row ? toStoryEvidence(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listByAngle(storyAngleId: StoryAngleId): Promise<readonly StoryEvidence[]> {
    try {
      const rows = await this.db.storyEvidence.findMany({
        where: { storyAngleId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toStoryEvidence);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async delete(id: StoryEvidenceId): Promise<void> {
    try {
      await this.db.storyEvidence.delete({ where: { id } });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}

/** Append-only adapter for story critiques (advisory scored assessments). */
export class PrismaStoryCritiqueRepository implements StoryCritiqueRepository {
  constructor(private readonly db: PrismaClient) {}

  async insert(critique: StoryCritique): Promise<void> {
    try {
      await this.db.storyCritique.create({ data: toStoryCritiqueFields(critique) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findById(id: StoryCritiqueId): Promise<StoryCritique | null> {
    try {
      const row = await this.db.storyCritique.findUnique({ where: { id } });
      return row ? toStoryCritique(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listByAngle(storyAngleId: StoryAngleId): Promise<readonly StoryCritique[]> {
    try {
      const rows = await this.db.storyCritique.findMany({
        where: { storyAngleId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toStoryCritique);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async delete(id: StoryCritiqueId): Promise<void> {
    try {
      await this.db.storyCritique.delete({ where: { id } });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
