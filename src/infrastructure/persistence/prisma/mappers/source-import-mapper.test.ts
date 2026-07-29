import { describe, expect, it } from "vitest";
import { PersistenceMappingError } from "../errors";
import { toSourceImportReceipt } from "../repositories/prisma-source-import-repository";

describe("source import mapper", () => {
  it("rejects corrupt completed rows instead of repairing them", () => {
    expect(() =>
      toSourceImportReceipt({
        id: "simp_00000001",
        ownerId: "usr_00000001",
        projectId: "proj_00000001",
        idempotencyKey: "key",
        status: "COMPLETED",
        sourceName: "clip.mov",
        sourceKind: "MEDIA",
        contentType: "video/quicktime",
        byteSize: 1,
        contentHash: "sha256:a",
        storageKey: "key",
        transcriptFormat: null,
        failureCode: null,
        mediaAssetId: null,
        transcriptDocumentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow(PersistenceMappingError);
  });
});
