import type { PrismaClient } from "@prisma/client";
import type {
  EvidenceReference,
  EvidenceReferenceId,
  EvidenceReferenceRepository,
} from "@/domain/evidence";
import type { MediaAssetId, TranscriptDocumentId } from "@/domain/media-transcript";
import type { ProjectId } from "@/domain/project";
import { translatePrismaError } from "../errors";
import { toEvidenceReference, toEvidenceReferenceFields } from "../mappers/evidence-mappers";

export class PrismaEvidenceReferenceRepository implements EvidenceReferenceRepository {
  constructor(private readonly db: PrismaClient) {}

  async insert(value: EvidenceReference): Promise<void> {
    try {
      await this.db.evidenceReference.create({ data: toEvidenceReferenceFields(value) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findById(id: EvidenceReferenceId): Promise<EvidenceReference | null> {
    try {
      const row = await this.db.evidenceReference.findUnique({ where: { id } });
      return row === null ? null : toEvidenceReference(row);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listByProject(projectId: ProjectId): Promise<readonly EvidenceReference[]> {
    return this.list({ projectId });
  }

  async listByMediaAsset(mediaAssetId: MediaAssetId): Promise<readonly EvidenceReference[]> {
    return this.list({ mediaAssetId });
  }

  async listByTranscriptDocument(
    transcriptDocumentId: TranscriptDocumentId,
  ): Promise<readonly EvidenceReference[]> {
    return this.list({ transcriptDocumentId });
  }

  private async list(where: {
    projectId?: ProjectId;
    mediaAssetId?: MediaAssetId;
    transcriptDocumentId?: TranscriptDocumentId;
  }): Promise<readonly EvidenceReference[]> {
    try {
      const rows = await this.db.evidenceReference.findMany({
        where,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
      return rows.map(toEvidenceReference);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
