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
  });

  it("installs query-backed compound indexes in PostgreSQL", async () => {
    const indexes = await db.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = current_schema()
        AND indexname IN (
          'entities_owner_id_created_at_idx',
          'story_angles_project_id_created_at_idx',
          'knowledge_sources_owner_id_created_at_idx'
        )
      ORDER BY indexname
    `;

    expect(indexes.map(({ indexname }) => indexname)).toEqual([
      "entities_owner_id_created_at_idx",
      "knowledge_sources_owner_id_created_at_idx",
      "story_angles_project_id_created_at_idx",
    ]);
  });
});
