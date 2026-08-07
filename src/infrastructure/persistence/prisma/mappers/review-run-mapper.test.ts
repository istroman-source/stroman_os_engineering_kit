import { describe, expect, it } from "vitest";
import { PersistenceMappingError } from "../errors";
import { toReviewRun, type ReviewRunRow } from "./review-run-mapper";

const row = {
  id: "rvw_AAAAAAA1",
  projectId: "proj_AAAAAAA1",
  rubricId: "rbr_AAAAAAA1",
  evaluationId: "eval_AAAAAAA1",
  reviewerId: "usr_AAAAAAAA",
  completedAt: new Date(),
  overrides: [
    {
      reviewRunId: "rvw_AAAAAAA1",
      rubricId: "rbr_AAAAAAA1",
      evaluationId: "eval_AAAAAAA1",
      criterionId: "crit_AAAAAAA1",
      originalScore: 5,
      overrideScore: 8,
      rationale: "human rationale",
    },
  ],
} as ReviewRunRow;

describe("review run mapper", () => {
  it("rejects corrupt persisted identifiers and scores", () => {
    expect(() => toReviewRun({ ...row, id: "bad" })).toThrow(PersistenceMappingError);
    expect(() =>
      toReviewRun({ ...row, overrides: [{ ...row.overrides[0]!, overrideScore: 99 }] }),
    ).toThrow(PersistenceMappingError);
    expect(() =>
      toReviewRun({ ...row, overrides: [{ ...row.overrides[0]!, rationale: " " }] }),
    ).toThrow(PersistenceMappingError);
  });
});
