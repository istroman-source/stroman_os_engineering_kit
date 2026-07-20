import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetAuthForTests, setRequestAuthenticatorForTests } from "@/server/composition";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";
import { TestAuthenticator } from "@test/adapters/test-auth";
import { call } from "@test/http/call";
import { GET as listEntities, POST as createEntity } from "./entities/route";
import { GET as entityKnowledge } from "./entities/[entityId]/knowledge/route";
import { GET as entityMemories } from "./entities/[entityId]/memories/route";
import { GET as entityRelationships } from "./entities/[entityId]/relationships/route";
import { POST as createSource } from "./sources/route";
import { GET as sourceMemories } from "./sources/[sourceId]/memories/route";
import { POST as createMemory } from "./memories/route";
import { GET as memoryInsights } from "./memories/[memoryId]/insights/route";
import { POST as createRelationship } from "./relationships/route";
import { POST as createInsight } from "./insights/route";

const ACTOR = "subject-owner-a";
const OTHER = "subject-owner-b";

let prisma: PrismaClient;

beforeAll(() => {
  prisma = createTestPrisma();
  setRequestAuthenticatorForTests(new TestAuthenticator());
});
afterAll(async () => {
  resetAuthForTests();
  await prisma.$disconnect();
});
beforeEach(async () => {
  await resetDatabase(prisma);
});

type CreateRoute = (
  req: Request,
  context?: { params: Promise<Record<string, never>> },
) => Promise<Response>;

async function id(handler: CreateRoute, json: unknown, principal = ACTOR): Promise<string> {
  const res = await call(handler, { method: "POST", principal, json });
  expect(res.status).toBe(201);
  return (res.body as { id: string }).id;
}

describe("Memory Engine — acceptance workflow", () => {
  it("captures Jimmy's + Michael knowledge and retrieves it with traceable sources and evidence", async () => {
    const jimmys = await id(createEntity, { name: "Jimmy's Famous Seafood", kind: "organization" });
    const michael = await id(createEntity, { name: "Michael Kramer", kind: "person" });
    const source = await id(createSource, { label: "Founder interview", sourceType: "interview" });

    const mem1 = await id(createMemory, {
      entityId: michael,
      sourceId: source,
      content: "Leads the brand with a bold, authentic voice.",
    });
    const mem2 = await id(createMemory, {
      entityId: michael,
      content: "Grew the audience through direct, personality-driven social video.",
    });

    await id(createRelationship, {
      fromEntityId: michael,
      toEntityId: jimmys,
      relationType: "leads",
    });

    await id(createInsight, {
      statement: "Michael's authenticity is the brand's core creative asset.",
      confidence: 0.9,
      evidence: "Consistent across the founder interview and social performance.",
      memoryIds: [mem1, mem2],
    });

    // Retrieve ALL Michael-related knowledge with traceable sources + evidence.
    const res = await call(entityKnowledge, { principal: ACTOR, params: { entityId: michael } });
    expect(res.status).toBe(200);
    const k = res.body as {
      entity: { name: string };
      memories: { memory: { id: string }; source: { label: string } | null }[];
      relationships: { direction: string; otherEntity: { name: string } | null }[];
      insights: {
        insight: { confidence: number; evidence: string | null };
        citedMemories: { id: string }[];
      }[];
    };
    expect(k.entity.name).toBe("Michael Kramer");
    expect(k.memories).toHaveLength(2);
    expect(k.memories.find((m) => m.memory.id === mem1)?.source?.label).toBe("Founder interview");
    expect(k.relationships).toHaveLength(1);
    expect(k.relationships[0]?.otherEntity?.name).toBe("Jimmy's Famous Seafood");
    expect(k.relationships[0]?.direction).toBe("outgoing");
    expect(k.insights).toHaveLength(1);
    expect(k.insights[0]?.insight.confidence).toBe(0.9);
    expect(k.insights[0]?.insight.evidence).toContain("interview");
    expect(k.insights[0]?.citedMemories).toHaveLength(2); // traceable evidence chain
  });

  it("retrieves memories by entity and by source, and insights by memory", async () => {
    const michael = await id(createEntity, { name: "Michael", kind: "person" });
    const source = await id(createSource, { label: "Notes", sourceType: "note" });
    const mem = await id(createMemory, { entityId: michael, sourceId: source, content: "Fact." });
    await id(createInsight, { statement: "Insight.", confidence: 0.5, memoryIds: [mem] });

    const byEntity = await call(entityMemories, {
      principal: ACTOR,
      params: { entityId: michael },
    });
    expect((byEntity.body as { items: unknown[] }).items).toHaveLength(1);
    const bySource = await call(sourceMemories, { principal: ACTOR, params: { sourceId: source } });
    expect((bySource.body as { items: unknown[] }).items).toHaveLength(1);
    const insights = await call(memoryInsights, { principal: ACTOR, params: { memoryId: mem } });
    expect((insights.body as { items: unknown[] }).items).toHaveLength(1);
    const rels = await call(entityRelationships, {
      principal: ACTOR,
      params: { entityId: michael },
    });
    expect((rels.body as { items: unknown[] }).items).toHaveLength(0);
  });

  it("rejects an insight with no memory references (400)", async () => {
    const res = await call(createInsight, {
      method: "POST",
      principal: ACTOR,
      json: { statement: "Unsupported claim", confidence: 0.5, memoryIds: [] },
    });
    expect(res.status).toBe(400);
  });

  it("rejects an insight citing a memory the caller does not own (403)", async () => {
    const michael = await id(createEntity, { name: "Michael", kind: "person" });
    const mem = await id(createMemory, { entityId: michael, content: "Owner A's fact." });
    const res = await call(createInsight, {
      method: "POST",
      principal: OTHER,
      json: { statement: "Stolen", confidence: 0.5, memoryIds: [mem] },
    });
    expect(res.status).toBe(403);
  });

  it("scopes knowledge to the owner (cross-owner access denied)", async () => {
    const michael = await id(createEntity, { name: "Michael", kind: "person" });
    const denied = await call(entityKnowledge, { principal: OTHER, params: { entityId: michael } });
    expect(denied.status).toBe(403);
    // And listing is owner-scoped.
    const mine = await call(listEntities, { principal: ACTOR });
    expect((mine.body as { items: unknown[] }).items).toHaveLength(1);
    const theirs = await call(listEntities, { principal: OTHER });
    expect((theirs.body as { items: unknown[] }).items).toHaveLength(0);
  });
});
