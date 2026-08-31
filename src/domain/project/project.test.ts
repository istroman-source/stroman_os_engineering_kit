import { describe, expect, it } from "vitest";
import { InvalidStateTransitionError } from "../shared";
import {
  activateProject,
  archiveProject,
  completeProject,
  createProject,
  renameProject,
  reopenProject,
  type Project,
} from "./project";
import { OwnerId, ProjectId } from "./project-id";
import { makeProjectName } from "./project-name";

const T0 = new Date("2026-07-17T00:00:00.000Z");
const T1 = new Date("2026-07-18T00:00:00.000Z");

function make(): Project {
  const id = ProjectId.unsafe("proj_ABCDEF12");
  const owner = OwnerId.unsafe("usr_ABCDEF12");
  const name = makeProjectName("Signature Dish Reel");
  if (!name.ok) throw name.error;
  return createProject({ id, ownerId: owner, name: name.value, now: T0 });
}

describe("ProjectName", () => {
  it("rejects empty and over-long names", () => {
    expect(makeProjectName("   ").ok).toBe(false);
    expect(makeProjectName("x".repeat(201)).ok).toBe(false);
    expect(makeProjectName("Valid").ok).toBe(true);
  });
});

describe("ProjectId / OwnerId", () => {
  it("validates prefixes and are not interchangeable", () => {
    expect(ProjectId.parse("proj_ABCDEF12").ok).toBe(true);
    expect(ProjectId.parse("usr_ABCDEF12").ok).toBe(false);
    expect(OwnerId.parse("usr_ABCDEF12").ok).toBe(true);
  });
});

describe("Project lifecycle", () => {
  it("renames without changing lifecycle state or mutating the original", () => {
    const original = make();
    const nextName = makeProjectName("Night Market Portrait");
    if (!nextName.ok) throw nextName.error;

    const renamed = renameProject(original, nextName.value, T1);

    expect(renamed.name).toBe("Night Market Portrait");
    expect(renamed.status).toBe("DRAFT");
    expect(renamed.updatedAt).toEqual(T1);
    expect(original.name).toBe("Signature Dish Reel");
  });

  it("is created in DRAFT with matching timestamps", () => {
    const p = make();
    expect(p.status).toBe("DRAFT");
    expect(p.createdAt).toEqual(T0);
    expect(p.updatedAt).toEqual(T0);
  });

  it("allows DRAFT -> ACTIVE -> COMPLETED -> ARCHIVED and bumps updatedAt", () => {
    const active = activateProject(make(), T1);
    expect(active.ok && active.value.status).toBe("ACTIVE");
    expect(active.ok && active.value.updatedAt).toEqual(T1);
    const completed = active.ok ? completeProject(active.value, T1) : active;
    expect(completed.ok && completed.value.status).toBe("COMPLETED");
    const archived = completed.ok ? archiveProject(completed.value, T1) : completed;
    expect(archived.ok && archived.value.status).toBe("ARCHIVED");
  });

  it("rejects illegal transitions with a typed error", () => {
    const result = completeProject(make(), T1); // DRAFT -> COMPLETED is illegal
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidStateTransitionError);
  });

  it("restores ARCHIVED work to ACTIVE without losing its identity", () => {
    const archived = archiveProject(make(), T1);
    expect(archived.ok).toBe(true);
    if (archived.ok) {
      const restored = reopenProject(archived.value, T1);
      expect(restored.ok && restored.value.status).toBe("ACTIVE");
      expect(restored.ok && restored.value.id).toBe(archived.value.id);
    }
  });

  it("reopens COMPLETED work but rejects reopening a DRAFT", () => {
    const active = activateProject(make(), T1);
    if (!active.ok) throw active.error;
    const completed = completeProject(active.value, T1);
    if (!completed.ok) throw completed.error;
    expect(reopenProject(completed.value, T1).ok).toBe(true);
    expect(reopenProject(make(), T1).ok).toBe(false);
  });

  it("does not mutate the original aggregate", () => {
    const p = make();
    activateProject(p, T1);
    expect(p.status).toBe("DRAFT");
  });
});
