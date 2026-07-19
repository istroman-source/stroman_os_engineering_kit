import { describe, expect, it } from "vitest";
import { OptimisticConcurrencyError } from "@/lib/errors";
import { InvalidStateTransitionError } from "@/domain/shared";
import { OwnerId, ProjectId } from "@/domain/project";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import { InMemoryProjectRepository } from "../../../test/adapters/in-memory-repositories";
import { NotAuthorizedError, NotFoundError, RepositoryError } from "../shared/errors";
import { createProject } from "./create-project";
import { getProject } from "./get-project";
import { listProjectsForOwner } from "./list-projects-for-owner";
import { activateProject, archiveProject, completeProject } from "./project-lifecycle";

const OWNER = OwnerId.unsafe("usr_00000001");
const OTHER = OwnerId.unsafe("usr_99999999");

function deps() {
  return {
    projects: new InMemoryProjectRepository(),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(new Date("2026-07-19T00:00:00.000Z")),
  };
}

describe("createProject", () => {
  it("creates a DRAFT project owned by the actor", async () => {
    const d = deps();
    const result = await createProject(d, { actorId: OWNER, name: "Signature Dish Reel" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("DRAFT");
      expect(result.value.name).toBe("Signature Dish Reel");
      // Ownership is verified separately; ownerId is intentionally not in the view.
      expect("ownerId" in result.value).toBe(false);
      const stored = await d.projects.findById(result.value.id);
      expect(stored?.ownerId).toBe(OWNER);
    }
  });

  it("rejects an invalid name and does not persist", async () => {
    const d = deps();
    const result = await createProject(d, { actorId: OWNER, name: "   " });
    expect(result.ok).toBe(false);
    expect(await d.projects.listByOwner(OWNER)).toHaveLength(0);
  });

  it("translates a repository failure safely", async () => {
    const d = deps();
    d.projects.fail = true;
    const result = await createProject(d, { actorId: OWNER, name: "X" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(RepositoryError);
  });
});

describe("getProject", () => {
  it("returns a project to its owner", async () => {
    const d = deps();
    const created = await createProject(d, { actorId: OWNER, name: "A" });
    if (!created.ok) throw created.error;
    const result = await getProject(d, { actorId: OWNER, projectId: created.value.id });
    expect(result.ok && result.value.id).toBe(created.value.id);
  });

  it("denies a non-owner", async () => {
    const d = deps();
    const created = await createProject(d, { actorId: OWNER, name: "A" });
    if (!created.ok) throw created.error;
    const result = await getProject(d, { actorId: OTHER, projectId: created.value.id });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });

  it("reports not found", async () => {
    const d = deps();
    const result = await getProject(d, {
      actorId: OWNER,
      projectId: ProjectId.unsafe("proj_deadbeef"),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
  });
});

describe("listProjectsForOwner", () => {
  it("returns only the actor's projects", async () => {
    const d = deps();
    await createProject(d, { actorId: OWNER, name: "Mine 1" });
    await createProject(d, { actorId: OWNER, name: "Mine 2" });
    await createProject(d, { actorId: OTHER, name: "Theirs" });
    const result = await listProjectsForOwner(d, { actorId: OWNER });
    expect(result.ok && result.value).toHaveLength(2);
  });
});

describe("project lifecycle", () => {
  it("activates a DRAFT project", async () => {
    const d = deps();
    const created = await createProject(d, { actorId: OWNER, name: "A" });
    if (!created.ok) throw created.error;
    const result = await activateProject(d, {
      actorId: OWNER,
      projectId: created.value.id,
      expectedVersion: created.value.lockVersion,
    });
    expect(result.ok && result.value.status).toBe("ACTIVE");
  });

  it("rejects an illegal transition and does not persist the change", async () => {
    const d = deps();
    const created = await createProject(d, { actorId: OWNER, name: "A" });
    if (!created.ok) throw created.error;
    // DRAFT -> COMPLETED is illegal.
    const result = await completeProject(d, {
      actorId: OWNER,
      projectId: created.value.id,
      expectedVersion: created.value.lockVersion,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidStateTransitionError);
    const stored = await d.projects.findById(created.value.id);
    expect(stored?.status).toBe("DRAFT");
  });

  it("denies lifecycle changes by a non-owner", async () => {
    const d = deps();
    const created = await createProject(d, { actorId: OWNER, name: "A" });
    if (!created.ok) throw created.error;
    const result = await activateProject(d, {
      actorId: OTHER,
      projectId: created.value.id,
      expectedVersion: created.value.lockVersion,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });

  it("rejects a stale expected version", async () => {
    const d = deps();
    const created = await createProject(d, { actorId: OWNER, name: "A" });
    if (!created.ok) throw created.error;
    const first = await activateProject(d, {
      actorId: OWNER,
      projectId: created.value.id,
      expectedVersion: created.value.lockVersion,
    });
    expect(first.ok).toBe(true);
    // Reusing the original (now stale) version must be rejected.
    const stale = await archiveProject(d, {
      actorId: OWNER,
      projectId: created.value.id,
      expectedVersion: created.value.lockVersion,
    });
    expect(stale.ok).toBe(false);
    if (!stale.ok) expect(stale.error).toBeInstanceOf(OptimisticConcurrencyError);
  });

  it("runs the full lifecycle through to ARCHIVED", async () => {
    const d = deps();
    const created = await createProject(d, { actorId: OWNER, name: "A" });
    if (!created.ok) throw created.error;
    const activated = await activateProject(d, {
      actorId: OWNER,
      projectId: created.value.id,
      expectedVersion: created.value.lockVersion,
    });
    if (!activated.ok) throw activated.error;
    const completed = await completeProject(d, {
      actorId: OWNER,
      projectId: created.value.id,
      expectedVersion: activated.value.lockVersion,
    });
    if (!completed.ok) throw completed.error;
    const archived = await archiveProject(d, {
      actorId: OWNER,
      projectId: created.value.id,
      expectedVersion: completed.value.lockVersion,
    });
    expect(archived.ok && archived.value.status).toBe("ARCHIVED");
  });
});
