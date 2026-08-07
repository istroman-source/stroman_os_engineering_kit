import { describe, expect, it } from "vitest";
import { OwnerId, ProjectId } from "../project";
import { approveRetrospective, createRetrospective } from "./retrospective";
import { LessonId, RetrospectiveId } from "./ids";
const now = new Date("2026-08-07T00:00:00Z");
const base = {
  id: RetrospectiveId.unsafe("retro_AAAAAAA1"),
  ownerId: OwnerId.unsafe("usr_AAAAAAAA"),
  projectId: ProjectId.unsafe("proj_AAAAAAA1"),
  context: {
    objective: "Tell a clear human story",
    outcome: "Audience understood the transformation",
    constraints: "Two-day shoot",
  },
  lessons: [
    {
      id: LessonId.unsafe("lesson_AAAAAAA1"),
      category: "WORKED" as const,
      content: "Opening on the result created immediate stakes.",
    },
  ],
  now,
};
describe("retrospective", () => {
  it("preserves ordered lessons and project context", () => {
    const result = createRetrospective(base);
    expect(result.ok && result.value).toMatchObject({
      status: "DRAFT",
      lockVersion: 1,
      context: base.context,
    });
  });
  it("rejects missing, duplicate, and blank learning", () => {
    expect(createRetrospective({ ...base, lessons: [] }).ok).toBe(false);
    expect(createRetrospective({ ...base, lessons: [base.lessons[0]!, base.lessons[0]!] }).ok).toBe(
      false,
    );
    expect(
      createRetrospective({ ...base, lessons: [{ ...base.lessons[0]!, content: " " }] }).ok,
    ).toBe(false);
  });
  it("requires one human approval and records authority", () => {
    const draft = createRetrospective(base);
    if (!draft.ok) throw draft.error;
    const approved = approveRetrospective(draft.value, { approvedBy: base.ownerId, now });
    expect(approved.ok && approved.value).toMatchObject({
      status: "APPROVED",
      approvedBy: base.ownerId,
    });
    if (!approved.ok) return;
    expect(approveRetrospective(approved.value, { approvedBy: base.ownerId, now }).ok).toBe(false);
  });
});
