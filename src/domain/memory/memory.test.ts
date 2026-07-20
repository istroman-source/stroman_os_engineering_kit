import { describe, expect, it } from "vitest";
import { InvalidValueError } from "../shared";
import { OwnerId } from "../project/project-id";
import {
  createEntity,
  createInsight,
  createMemory,
  createRelationship,
  createSource,
  EntityId,
  InsightId,
  MemoryId,
  RelationshipId,
  SourceId,
} from "./index";

const OWNER = OwnerId.unsafe("usr_ABCDEF12");
const T0 = new Date("2026-07-19T00:00:00.000Z");
const ent = (n: string) => EntityId.unsafe(`ent_${n}`);
const mem = (n: string) => MemoryId.unsafe(`mem_${n}`);

describe("memory domain", () => {
  it("creates an entity and rejects a blank name", () => {
    expect(
      createEntity({
        id: ent("A1234567"),
        ownerId: OWNER,
        name: "Michael Kramer",
        kind: "person",
        now: T0,
      }).ok,
    ).toBe(true);
    const bad = createEntity({
      id: ent("A1234567"),
      ownerId: OWNER,
      name: "  ",
      kind: "person",
      now: T0,
    });
    expect(bad.ok).toBe(false);
  });

  it("creates a source with optional fields normalized", () => {
    const s = createSource({
      id: SourceId.unsafe("src_A1234567"),
      ownerId: OWNER,
      label: "Interview",
      sourceType: "interview",
      url: "  ",
      now: T0,
    });
    expect(s.ok).toBe(true);
    if (s.ok) expect(s.value.url).toBeNull();
  });

  it("creates a memory about an entity", () => {
    const m = createMemory({
      id: mem("A1234567"),
      ownerId: OWNER,
      entityId: ent("A1234567"),
      content: "Founded the company",
      now: T0,
    });
    expect(m.ok).toBe(true);
  });

  it("rejects a self-referential relationship", () => {
    const r = createRelationship({
      id: RelationshipId.unsafe("rel_A1234567"),
      ownerId: OWNER,
      fromEntityId: ent("A1234567"),
      toEntityId: ent("A1234567"),
      relationType: "knows",
      now: T0,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBeInstanceOf(InvalidValueError);
  });

  it("requires an insight to cite at least one memory", () => {
    const none = createInsight({
      id: InsightId.unsafe("ins_A1234567"),
      ownerId: OWNER,
      statement: "He values authenticity",
      confidence: 0.8,
      memoryIds: [],
      now: T0,
    });
    expect(none.ok).toBe(false);
    if (!none.ok) expect(none.error).toBeInstanceOf(InvalidValueError);
  });

  it("creates an insight with confidence + evidence + deduped memory refs", () => {
    const i = createInsight({
      id: InsightId.unsafe("ins_A1234567"),
      ownerId: OWNER,
      statement: "He values authenticity",
      confidence: 0.9,
      evidence: "Repeated across interviews",
      memoryIds: [mem("A1234567"), mem("A1234567"), mem("B1234567")],
      now: T0,
    });
    expect(i.ok).toBe(true);
    if (i.ok) {
      expect(i.value.memoryIds).toHaveLength(2);
      expect(i.value.confidence).toBe(0.9);
      expect(i.value.evidence).toBe("Repeated across interviews");
    }
  });

  it("rejects an out-of-range confidence", () => {
    const i = createInsight({
      id: InsightId.unsafe("ins_A1234567"),
      ownerId: OWNER,
      statement: "x",
      confidence: 1.5,
      memoryIds: [mem("A1234567")],
      now: T0,
    });
    expect(i.ok).toBe(false);
  });
});
