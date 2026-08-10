import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const NOW = new Date("2026-08-10T12:00:00.000Z");
let db: PrismaClient;

beforeAll(() => {
  db = createTestPrisma();
});
afterAll(() => db.$disconnect());
beforeEach(() => resetDatabase(db));

describe("Prompt 017 database workspace constraints (real PostgreSQL)", () => {
  it("rejects cross-owner memory graph references at the persistence boundary", async () => {
    await db.entity.create({
      data: {
        id: "ent_AAAAAAA1",
        ownerId: "usr_owner_a",
        name: "A",
        kind: "person",
        createdAt: NOW,
      },
    });

    await expect(
      db.memory.create({
        data: {
          id: "mem_AAAAAAA1",
          ownerId: "usr_owner_b",
          entityId: "ent_AAAAAAA1",
          content: "Must not cross owners",
          createdAt: NOW,
        },
      }),
    ).rejects.toBeTruthy();
  });

  it("preserves nullable source cleanup within an owner", async () => {
    await db.entity.create({
      data: {
        id: "ent_AAAAAAA1",
        ownerId: "usr_owner_a",
        name: "A",
        kind: "person",
        createdAt: NOW,
      },
    });
    await db.source.create({
      data: {
        id: "src_AAAAAAA1",
        ownerId: "usr_owner_a",
        label: "Source",
        sourceType: "note",
        createdAt: NOW,
      },
    });
    await db.memory.create({
      data: {
        id: "mem_AAAAAAA1",
        ownerId: "usr_owner_a",
        entityId: "ent_AAAAAAA1",
        sourceId: "src_AAAAAAA1",
        content: "Traceable fact",
        createdAt: NOW,
      },
    });

    await db.source.delete({ where: { id: "src_AAAAAAA1" } });

    await expect(
      db.memory.findUniqueOrThrow({ where: { id: "mem_AAAAAAA1" } }),
    ).resolves.toMatchObject({ ownerId: "usr_owner_a", sourceId: null });
  });

  it("rejects cross-owner project and knowledge-acquisition references", async () => {
    await db.project.create({
      data: {
        id: "prj_AAAAAAA1",
        ownerId: "usr_owner_a",
        name: "Owner A project",
        status: "ACTIVE",
        createdAt: NOW,
        updatedAt: NOW,
      },
    });
    await expect(
      db.storyAngle.create({
        data: {
          id: "ang_AAAAAAA1",
          ownerId: "usr_owner_b",
          projectId: "prj_AAAAAAA1",
          title: "Cross-owner angle",
          theme: "Theme",
          premise: "Premise",
          audiencePromise: "Promise",
          centralQuestion: "Question?",
          status: "DRAFT",
          createdAt: NOW,
        },
      }),
    ).rejects.toBeTruthy();

    await db.knowledgeSource.create({
      data: {
        id: "ksrc_AAAAAAA1",
        ownerId: "usr_owner_a",
        name: "Owner A source",
        sourceType: "MANUAL",
        sourceReliability: "VERIFIED",
        status: "ACTIVE",
        createdAt: NOW,
      },
    });
    await expect(
      db.sourceDocument.create({
        data: {
          id: "kdoc_AAAAAAA1",
          ownerId: "usr_owner_b",
          knowledgeSourceId: "ksrc_AAAAAAA1",
          documentType: "NOTE",
          contentHash: "a".repeat(64),
          title: "Cross-owner document",
          createdAt: NOW,
        },
      }),
    ).rejects.toBeTruthy();
    await expect(
      db.acquisitionRun.create({
        data: {
          id: "krun_AAAAAAA1",
          ownerId: "usr_owner_b",
          knowledgeSourceId: "ksrc_AAAAAAA1",
          extractor: "test",
          extractorVersion: "1",
          status: "PENDING",
          createdAt: NOW,
        },
      }),
    ).rejects.toBeTruthy();
  });

  it("rejects every owner-aligned memory and story relationship independently", async () => {
    const owners = ["usr_owner_a", "usr_owner_b"] as const;
    for (const ownerId of owners) {
      await db.entity.createMany({
        data: ["1", "2"].map((suffix) => ({
          id: `ent_${ownerId}_${suffix}`,
          ownerId,
          name: suffix,
          kind: "person",
          createdAt: NOW,
        })),
      });
      await db.project.create({
        data: {
          id: `prj_${ownerId}`,
          ownerId,
          name: ownerId,
          status: "ACTIVE",
          createdAt: NOW,
          updatedAt: NOW,
        },
      });
      await db.storyAngle.create({
        data: {
          id: `ang_${ownerId}`,
          ownerId,
          projectId: `prj_${ownerId}`,
          title: ownerId,
          theme: "Theme",
          premise: "Premise",
          audiencePromise: "Promise",
          centralQuestion: "Question?",
          status: "DRAFT",
          createdAt: NOW,
        },
      });
      await db.memory.create({
        data: {
          id: `mem_${ownerId}`,
          ownerId,
          entityId: `ent_${ownerId}_1`,
          content: ownerId,
          createdAt: NOW,
        },
      });
      await db.source.create({
        data: {
          id: `src_${ownerId}`,
          ownerId,
          label: ownerId,
          sourceType: "note",
          createdAt: NOW,
        },
      });
      await db.insight.create({
        data: {
          id: `ins_${ownerId}`,
          ownerId,
          statement: ownerId,
          confidence: 0.8,
          createdAt: NOW,
        },
      });
    }

    const rejectedWrites = [
      db.memory.create({
        data: {
          id: "mem_bad_source",
          ownerId: "usr_owner_b",
          entityId: "ent_usr_owner_b_1",
          sourceId: "src_usr_owner_a",
          content: "invalid",
          createdAt: NOW,
        },
      }),
      db.relationship.create({
        data: {
          id: "rel_bad_from",
          ownerId: "usr_owner_b",
          fromEntityId: "ent_usr_owner_a_1",
          toEntityId: "ent_usr_owner_b_2",
          relationType: "knows",
          createdAt: NOW,
        },
      }),
      db.relationship.create({
        data: {
          id: "rel_bad_to",
          ownerId: "usr_owner_b",
          fromEntityId: "ent_usr_owner_b_1",
          toEntityId: "ent_usr_owner_a_2",
          relationType: "knows",
          createdAt: NOW,
        },
      }),
      db.storyEvidence.create({
        data: {
          id: "sev_bad_angle",
          ownerId: "usr_owner_b",
          storyAngleId: "ang_usr_owner_a",
          memoryId: "mem_usr_owner_b",
          role: "PRIMARY",
          reason: "invalid",
          createdAt: NOW,
        },
      }),
      db.storyEvidence.create({
        data: {
          id: "sev_bad_memory",
          ownerId: "usr_owner_b",
          storyAngleId: "ang_usr_owner_b",
          memoryId: "mem_usr_owner_a",
          role: "PRIMARY",
          reason: "invalid",
          createdAt: NOW,
        },
      }),
      db.storyEvidence.create({
        data: {
          id: "sev_bad_insight",
          ownerId: "usr_owner_b",
          storyAngleId: "ang_usr_owner_b",
          insightId: "ins_usr_owner_a",
          role: "PRIMARY",
          reason: "invalid",
          createdAt: NOW,
        },
      }),
      db.storyCritique.create({
        data: {
          id: "scr_bad_angle",
          ownerId: "usr_owner_b",
          storyAngleId: "ang_usr_owner_a",
          criticType: "AI",
          evidenceStrength: 5,
          emotionalPotential: 5,
          visualPotential: 5,
          brandAlignment: 5,
          originality: 5,
          interviewPotential: 5,
          strengths: "none",
          weaknesses: "invalid",
          recommendation: "REVISE",
          rationale: "invalid",
          createdAt: NOW,
        },
      }),
    ];

    for (const write of rejectedWrites) await expect(write).rejects.toBeTruthy();
  });

  it("rejects source-lineage and review/materialization misalignment independently", async () => {
    for (const [suffix, ownerId] of [
      ["a1", "usr_owner_a"],
      ["a2", "usr_owner_a"],
      ["b1", "usr_owner_b"],
    ] as const) {
      await db.knowledgeSource.create({
        data: {
          id: `ksrc_${suffix}`,
          ownerId,
          name: suffix,
          sourceType: "MANUAL",
          sourceReliability: "VERIFIED",
          status: "ACTIVE",
          createdAt: NOW,
        },
      });
      await db.sourceDocument.create({
        data: {
          id: `kdoc_${suffix}`,
          ownerId,
          knowledgeSourceId: `ksrc_${suffix}`,
          documentType: "NOTE",
          contentHash: suffix.padEnd(64, "0"),
          title: suffix,
          createdAt: NOW,
        },
      });
      await db.acquisitionRun.create({
        data: {
          id: `krun_${suffix}`,
          ownerId,
          knowledgeSourceId: `ksrc_${suffix}`,
          extractor: "test",
          extractorVersion: "1",
          status: "SUCCEEDED",
          createdAt: NOW,
        },
      });
    }

    const observationData = (suffix: "a1" | "a2" | "b1") => ({
      id: `kobs_${suffix}`,
      ownerId: suffix === "b1" ? "usr_owner_b" : "usr_owner_a",
      observationType: "ENTITY" as const,
      payload: { name: suffix },
      sourceDocumentId: `kdoc_${suffix}`,
      knowledgeSourceId: `ksrc_${suffix}`,
      acquisitionRunId: `krun_${suffix}`,
      createdBy: "IMPORT" as const,
      status: "PENDING_REVIEW" as const,
      createdAt: NOW,
    });

    await expect(
      db.knowledgeObservation.create({
        data: { ...observationData("a2"), id: "kobs_bad_doc", sourceDocumentId: "kdoc_a1" },
      }),
    ).rejects.toBeTruthy();
    await expect(
      db.knowledgeObservation.create({
        data: { ...observationData("a2"), id: "kobs_bad_run", acquisitionRunId: "krun_a1" },
      }),
    ).rejects.toBeTruthy();

    await db.knowledgeObservation.createMany({
      data: [observationData("a1"), observationData("b1")],
    });
    await expect(
      db.knowledgeReview.create({
        data: {
          id: "krev_bad_owner",
          ownerId: "usr_owner_b",
          knowledgeObservationId: "kobs_a1",
          outcome: "ACCEPT",
          reviewerId: "usr_owner_b",
          reviewedAt: NOW,
          createdAt: NOW,
        },
      }),
    ).rejects.toBeTruthy();

    await db.knowledgeReview.createMany({
      data: [
        {
          id: "krev_a1",
          ownerId: "usr_owner_a",
          knowledgeObservationId: "kobs_a1",
          outcome: "ACCEPT",
          reviewerId: "usr_owner_a",
          reviewedAt: NOW,
          createdAt: NOW,
        },
        {
          id: "krev_b1",
          ownerId: "usr_owner_b",
          knowledgeObservationId: "kobs_b1",
          outcome: "ACCEPT",
          reviewerId: "usr_owner_b",
          reviewedAt: NOW,
          createdAt: NOW,
        },
      ],
    });
    await expect(
      db.observationMaterialization.create({
        data: {
          knowledgeObservationId: "kobs_b1",
          knowledgeReviewId: "krev_a1",
          recordType: "ENTITY",
          recordId: "ent_invalid",
          ownerId: "usr_owner_a",
          createdAt: NOW,
        },
      }),
    ).rejects.toBeTruthy();
    await expect(
      db.observationMaterialization.create({
        data: {
          knowledgeObservationId: "kobs_a1",
          knowledgeReviewId: "krev_b1",
          recordType: "MEMORY",
          recordId: "mem_invalid",
          ownerId: "usr_owner_a",
          createdAt: NOW,
        },
      }),
    ).rejects.toBeTruthy();
  });

  it("installs query-backed compound indexes in PostgreSQL", async () => {
    const indexes = await db.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = current_schema()
        AND indexname IN (
          'entities_owner_id_created_at_idx',
          'story_angles_project_id_created_at_idx',
          'knowledge_sources_owner_id_created_at_idx',
          'knowledge_observations_document_alignment_idx',
          'knowledge_observations_run_alignment_idx'
        )
      ORDER BY indexname
    `;

    const indexNames = indexes.map(({ indexname }) => indexname);
    expect(indexNames).toHaveLength(5);
    expect(indexNames).toEqual(
      expect.arrayContaining([
        "entities_owner_id_created_at_idx",
        "knowledge_sources_owner_id_created_at_idx",
        "knowledge_observations_document_alignment_idx",
        "knowledge_observations_run_alignment_idx",
        "story_angles_project_id_created_at_idx",
      ]),
    );
  });
});
