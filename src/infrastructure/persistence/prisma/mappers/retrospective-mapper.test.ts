import { describe, expect, it } from "vitest";
import { PersistenceMappingError } from "../errors";
import { toRetrospective, type RetrospectiveRow } from "./retrospective-mapper";
const row = {
  id: "retro_AAAAAAA1",
  ownerId: "usr_AAAAAAAA",
  projectId: "proj_AAAAAAA1",
  objective: "Objective",
  outcome: "Outcome",
  constraints: null,
  status: "DRAFT",
  createdAt: new Date(),
  approvedAt: null,
  approvedBy: null,
  lockVersion: 1,
  lessons: [
    {
      id: "lesson_AAAAAAA1",
      retrospectiveId: "retro_AAAAAAA1",
      category: "WORKED",
      content: "It worked",
      position: 0,
    },
  ],
} as RetrospectiveRow;
describe("retrospective mapper", () => {
  it("rejects corrupt identifiers, content, and lifecycle shapes", () => {
    expect(() => toRetrospective({ ...row, id: "bad" })).toThrow(PersistenceMappingError);
    expect(() =>
      toRetrospective({ ...row, lessons: [{ ...row.lessons[0]!, content: " " }] }),
    ).toThrow(PersistenceMappingError);
    expect(() => toRetrospective({ ...row, status: "APPROVED" })).toThrow(PersistenceMappingError);
    expect(() =>
      toRetrospective({ ...row, lessons: [{ ...row.lessons[0]!, position: 2 }] }),
    ).toThrow(PersistenceMappingError);
  });
});
