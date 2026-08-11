import { Prisma, type CreativeBrief as CreativeBriefRow } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  CreativeBriefId,
  createCreativeBrief,
  generateBlueprint,
  generateDevelopmentBlueprint,
} from "@/domain/creative";
import { ProjectId } from "@/domain/project";
import { PersistenceMappingError } from "../errors";
import { toCreativeBrief } from "./creative-brief-mapper";

function fixture() {
  const now = new Date("2026-08-10T00:00:00.000Z");
  const created = createCreativeBrief({
    id: CreativeBriefId.unsafe("brief_AAAAAAA1"),
    projectId: ProjectId.unsafe("proj_AAAAAAA1"),
    now,
    title: "Morning routine of an everyday mom who eats Jimmy's Famous Meals",
    client: "Jimmy's Famous Meals",
    projectType: "Commercial",
    creativeGoal: "Conversion",
    targetAudience: "Parents",
    desiredEmotion: "Understood",
    context: "Do not show the baby's face.",
  });
  if (!created.ok) throw created.error;
  const development = generateDevelopmentBlueprint(created.value);
  const current = generateBlueprint(created.value, development);
  const row: CreativeBriefRow = {
    id: created.value.id,
    projectId: created.value.projectId,
    title: created.value.title,
    client: created.value.client,
    projectType: created.value.projectType,
    creativeGoal: created.value.creativeGoal,
    targetAudience: created.value.targetAudience,
    desiredEmotion: created.value.desiredEmotion,
    context: created.value.context,
    blueprint: current as unknown as Prisma.JsonValue,
    reasoningProvider: "fixture",
    planningContext: null,
    createdAt: now,
    updatedAt: now,
    lockVersion: 1,
  };
  return { row, current, development };
}

describe("creative brief persistence mapping", () => {
  it("retires only a structurally valid legacy rendered storyboard", () => {
    const { row, current, development } = fixture();
    const legacy = { ...current, development };
    expect(
      toCreativeBrief({ ...row, blueprint: legacy as unknown as Prisma.JsonValue }).blueprint,
    ).toBeNull();
  });

  it("rejects malformed JSON that merely imitates the legacy status marker", () => {
    const { row } = fixture();
    expect(() =>
      toCreativeBrief({
        ...row,
        blueprint: {
          development: { storyboard: { status: "RENDERED" } },
        } as Prisma.JsonValue,
      }),
    ).toThrow(PersistenceMappingError);
  });

  it("rejects malformed persisted planning state", () => {
    const { row } = fixture();
    expect(() =>
      toCreativeBrief({
        ...row,
        planningContext: {
          version: 1,
          stage: "READYISH",
          production: {},
          scoutPhotos: [],
          spatialClaims: [],
          corrections: [],
        } as unknown as Prisma.JsonValue,
      }),
    ).toThrow(PersistenceMappingError);
  });
});
