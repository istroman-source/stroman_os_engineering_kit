import { describe, expect, it } from "vitest";
import { NotAuthorizedError, NotFoundError } from "../shared/errors";
import { createProject, makeProjectName, OwnerId, ProjectId } from "@/domain/project";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import { InMemoryProjectRepository } from "../../../test/adapters/in-memory-repositories";
import { InMemoryCreativeBriefRepository } from "../../../test/adapters/in-memory-creative-brief-repository";
import { getCreativeBrief } from "./get-creative-brief";
import { saveCreativeBrief } from "./save-creative-brief";

const OWNER = OwnerId.unsafe("usr_OWNER001");
const OTHER = OwnerId.unsafe("usr_OTHER001");
const PROJECT = ProjectId.unsafe("proj_AAAAAAA1");

function fields() {
  return {
    title: "Signature Dish Reel",
    client: "Jimmy's Famous Seafood",
    projectType: "Instagram reel",
    creativeGoal: "make viewers crave the crab cake",
    targetAudience: "Baltimore food lovers",
    desiredEmotion: "hungry",
    context: "20s vertical, fast cuts.",
  };
}

function deps() {
  const projects = new InMemoryProjectRepository();
  const name = makeProjectName("Reel");
  if (!name.ok) throw name.error;
  projects.insert(
    createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: new Date("2026-07-19") }),
  );
  return {
    projects,
    creativeBriefs: new InMemoryCreativeBriefRepository(),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(new Date("2026-07-19T00:00:00.000Z")),
  };
}

describe("saveCreativeBrief", () => {
  it("creates a brief and returns a blueprint on first analysis", async () => {
    const d = deps();
    const result = await saveCreativeBrief(d, {
      actorId: OWNER,
      projectId: PROJECT,
      fields: fields(),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.brief.title).toBe("Signature Dish Reel");
    expect(result.value.blueprint.hookConcepts).toHaveLength(3);
  });

  it("updates the brief on re-analysis (same project)", async () => {
    const d = deps();
    await saveCreativeBrief(d, { actorId: OWNER, projectId: PROJECT, fields: fields() });
    const again = await saveCreativeBrief(d, {
      actorId: OWNER,
      projectId: PROJECT,
      fields: { ...fields(), desiredEmotion: "nostalgic" },
    });
    expect(again.ok).toBe(true);
    if (!again.ok) return;
    expect(again.value.brief.desiredEmotion).toBe("nostalgic");
    // Still exactly one brief for the project.
    expect(await d.creativeBriefs.findByProject(PROJECT)).not.toBeNull();
  });

  it("denies analyzing another owner's project", async () => {
    const d = deps();
    const result = await saveCreativeBrief(d, {
      actorId: OTHER,
      projectId: PROJECT,
      fields: fields(),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });

  it("returns NotFound for a missing project", async () => {
    const d = deps();
    const result = await saveCreativeBrief(d, {
      actorId: OWNER,
      projectId: ProjectId.unsafe("proj_MISSING1"),
      fields: fields(),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
  });
});

describe("getCreativeBrief", () => {
  it("returns NotFound before analysis, then the analysis after", async () => {
    const d = deps();
    const before = await getCreativeBrief(d, { actorId: OWNER, projectId: PROJECT });
    expect(before.ok).toBe(false);

    await saveCreativeBrief(d, { actorId: OWNER, projectId: PROJECT, fields: fields() });
    const after = await getCreativeBrief(d, { actorId: OWNER, projectId: PROJECT });
    expect(after.ok).toBe(true);
    if (after.ok) expect(after.value.blueprint.masterPrompt).toContain("Signature Dish Reel");
  });

  it("denies another owner", async () => {
    const d = deps();
    await saveCreativeBrief(d, { actorId: OWNER, projectId: PROJECT, fields: fields() });
    const denied = await getCreativeBrief(d, { actorId: OTHER, projectId: PROJECT });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toBeInstanceOf(NotAuthorizedError);
  });
});
