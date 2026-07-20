import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createEntity,
  createInsight,
  createMemory,
  createSource,
  type Entity,
  EntityId,
  type Insight,
  InsightId,
  type MemoryRecord,
  MemoryId,
  type Source,
  SourceId,
} from "@/domain/memory";
import { OwnerId } from "@/domain/project";
import {
  PrismaEntityRepository,
  PrismaInsightRepository,
  PrismaMemoryRepository,
  PrismaSourceRepository,
} from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const OWNER = OwnerId.unsafe("usr_AAAAAAAA");
const T0 = new Date("2026-07-19T00:00:00.000Z");

function unwrap<T>(r: { ok: true; value: T } | { ok: false; error: unknown }): T {
  if (!r.ok) throw r.error;
  return r.value;
}

let prisma: PrismaClient;
let entities: PrismaEntityRepository;
let sources: PrismaSourceRepository;
let memories: PrismaMemoryRepository;
let insights: PrismaInsightRepository;

beforeAll(() => {
  prisma = createTestPrisma();
  entities = new PrismaEntityRepository(prisma);
  sources = new PrismaSourceRepository(prisma);
  memories = new PrismaMemoryRepository(prisma);
  insights = new PrismaInsightRepository(prisma);
});
afterAll(async () => {
  await prisma.$disconnect();
});
beforeEach(async () => {
  await resetDatabase(prisma);
});

async function seedMemory(suffix: string): Promise<{ entity: Entity; memory: MemoryRecord }> {
  const entity = unwrap(
    createEntity({
      id: EntityId.unsafe(`ent_${suffix}`),
      ownerId: OWNER,
      name: "Michael",
      kind: "person",
      now: T0,
    }),
  );
  await entities.insert(entity);
  const memory = unwrap(
    createMemory({
      id: MemoryId.unsafe(`mem_${suffix}`),
      ownerId: OWNER,
      entityId: entity.id,
      content: "Fact",
      now: T0,
    }),
  );
  await memories.insert(memory);
  return { entity, memory };
}

describe("PrismaMemory repositories (real PostgreSQL)", () => {
  it("persists an entity, a source, and a memory traceable to the source", async () => {
    const source: Source = unwrap(
      createSource({
        id: SourceId.unsafe("src_AAAAAAAA"),
        ownerId: OWNER,
        label: "Interview",
        sourceType: "interview",
        now: T0,
      }),
    );
    await sources.insert(source);
    const entity = unwrap(
      createEntity({
        id: EntityId.unsafe("ent_AAAAAAAA"),
        ownerId: OWNER,
        name: "Michael",
        kind: "person",
        now: T0,
      }),
    );
    await entities.insert(entity);
    const memory = unwrap(
      createMemory({
        id: MemoryId.unsafe("mem_AAAAAAAA"),
        ownerId: OWNER,
        entityId: entity.id,
        sourceId: source.id,
        content: "Fact",
        now: T0,
      }),
    );
    await memories.insert(memory);

    expect(await memories.listByEntity(entity.id)).toHaveLength(1);
    expect((await memories.listBySource(source.id))[0]?.sourceId).toBe(source.id);
    expect(await entities.listByOwner(OWNER)).toHaveLength(1);
  });

  it("persists an insight with its memory references and retrieves it by memory", async () => {
    const a = await seedMemory("AAAAAAA1");
    const b = await seedMemory("BBBBBBB1");
    const insight: Insight = unwrap(
      createInsight({
        id: InsightId.unsafe("ins_AAAAAAAA"),
        ownerId: OWNER,
        statement: "He values authenticity",
        confidence: 0.9,
        evidence: "seen twice",
        memoryIds: [a.memory.id, b.memory.id],
        now: T0,
      }),
    );
    await insights.insert(insight);

    const found = await insights.findById(insight.id);
    expect(found?.memoryIds).toHaveLength(2);
    expect(found?.confidence).toBe(0.9);
    expect(await insights.listByMemory(a.memory.id)).toHaveLength(1);
    expect(await insights.listByMemoryIds([b.memory.id])).toHaveLength(1);
  });

  it("refuses to delete a memory still cited by an insight (integrity)", async () => {
    const { memory } = await seedMemory("CCCCCCC1");
    const insight = unwrap(
      createInsight({
        id: InsightId.unsafe("ins_CCCCCCCC"),
        ownerId: OWNER,
        statement: "x",
        confidence: 0.5,
        memoryIds: [memory.id],
        now: T0,
      }),
    );
    await insights.insert(insight);

    let threw = false;
    try {
      await memories.delete(memory.id);
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
    // Deleting the insight first removes the reference, then the memory can go.
    await insights.delete(insight.id);
    await memories.delete(memory.id);
    expect(await memories.findById(memory.id)).toBeNull();
  });
});
