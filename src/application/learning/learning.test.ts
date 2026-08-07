import { describe, expect, it } from "vitest";
import { OwnerId } from "@/domain/project";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import {
  InMemoryProjectRepository,
  InMemoryRetrospectiveRepository,
} from "../../../test/adapters/in-memory-repositories";
import { createProject } from "../project";
import { NotAuthorizedError } from "../shared/errors";
import {
  approveRetrospective,
  createRetrospective,
  getRetrospective,
  listRetrospectives,
} from "./learning";
const OWNER = OwnerId.unsafe("usr_AAAAAAAA");
const OTHER = OwnerId.unsafe("usr_OTHER001");
const env = () => ({
  projects: new InMemoryProjectRepository(),
  retrospectives: new InMemoryRetrospectiveRepository(),
  ids: new SequentialIdGenerator(),
  clock: new FixedClock(new Date("2026-08-07T00:00:00Z")),
});
async function setup(e: ReturnType<typeof env>) {
  const project = await createProject(e, { actorId: OWNER, name: "Film" });
  if (!project.ok) throw project.error;
  return project.value.id;
}
describe("learning workflows", () => {
  it("creates, approves, gets, and lists an owner-scoped retrospective", async () => {
    const e = env();
    const projectId = await setup(e);
    const created = await createRetrospective(e, {
      actorId: OWNER,
      projectId,
      objective: "Make it human",
      outcome: "Clear emotional arc",
      lessons: [{ category: "REPEAT", content: "Interview before capturing b-roll." }],
    });
    if (!created.ok) throw created.error;
    const approved = await approveRetrospective(e, {
      actorId: OWNER,
      retrospectiveId: created.value.id,
      expectedVersion: 1,
    });
    expect(approved.ok && approved.value).toMatchObject({ status: "APPROVED", lockVersion: 2 });
    const loaded = await getRetrospective(e, { actorId: OWNER, retrospectiveId: created.value.id });
    expect(loaded.ok && loaded.value.lessons[0]?.position).toBe(0);
    const list = await listRetrospectives(e, { actorId: OWNER, projectId });
    expect(list.ok && list.value).toHaveLength(1);
  });
  it("denies non-owner reads, writes, lists, and approvals", async () => {
    const e = env();
    const projectId = await setup(e);
    const denied = await createRetrospective(e, {
      actorId: OTHER,
      projectId,
      objective: "x",
      outcome: "y",
      lessons: [{ category: "AVOID", content: "z" }],
    });
    expect(!denied.ok && denied.error).toBeInstanceOf(NotAuthorizedError);
    const list = await listRetrospectives(e, { actorId: OTHER, projectId });
    expect(!list.ok && list.error).toBeInstanceOf(NotAuthorizedError);
  });
  it("rejects stale approval versions", async () => {
    const e = env();
    const projectId = await setup(e);
    const created = await createRetrospective(e, {
      actorId: OWNER,
      projectId,
      objective: "x",
      outcome: "y",
      lessons: [{ category: "WORKED", content: "z" }],
    });
    if (!created.ok) throw created.error;
    expect(
      (
        await approveRetrospective(e, {
          actorId: OWNER,
          retrospectiveId: created.value.id,
          expectedVersion: 99,
        })
      ).ok,
    ).toBe(false);
  });
});
