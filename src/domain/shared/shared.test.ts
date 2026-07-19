import { describe, expect, it } from "vitest";
import { makeConfidence } from "./confidence";
import { InvalidStateTransitionError, InvalidValueError } from "./domain-error";
import { defineId } from "./identifier";
import { makeScore, MAX_SCORE, MIN_SCORE } from "./score";
import { makeSlug } from "./slug";
import { validateBoundedText } from "./text";
import { defineStateMachine } from "./transition";

describe("makeConfidence", () => {
  it("accepts values within [0, 1]", () => {
    expect(makeConfidence(0)).toEqual({ ok: true, value: 0 });
    expect(makeConfidence(0.5)).toEqual({ ok: true, value: 0.5 });
    expect(makeConfidence(1)).toEqual({ ok: true, value: 1 });
  });

  it("rejects out-of-range and non-finite values", () => {
    for (const bad of [-0.01, 1.01, Number.NaN, Number.POSITIVE_INFINITY]) {
      const result = makeConfidence(bad);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBeInstanceOf(InvalidValueError);
    }
  });
});

describe("makeScore", () => {
  it("accepts integers on the 1–10 scale", () => {
    expect(makeScore(MIN_SCORE)).toEqual({ ok: true, value: 1 });
    expect(makeScore(MAX_SCORE)).toEqual({ ok: true, value: 10 });
  });

  it("rejects non-integers and out-of-range values", () => {
    for (const bad of [0, 11, 5.5, Number.NaN]) {
      expect(makeScore(bad).ok).toBe(false);
    }
  });
});

describe("makeSlug", () => {
  it("accepts well-formed slugs", () => {
    expect(makeSlug("signature-dish-reel")).toEqual({ ok: true, value: "signature-dish-reel" });
  });

  it("rejects malformed slugs", () => {
    for (const bad of ["", "Has Spaces", "Upper", "trailing-", "double--hyphen", "  "]) {
      expect(makeSlug(bad).ok).toBe(false);
    }
  });
});

describe("validateBoundedText", () => {
  it("trims and enforces bounds", () => {
    expect(validateBoundedText("  hi  ", { label: "X", max: 10 })).toEqual({
      ok: true,
      value: "hi",
    });
    expect(validateBoundedText("", { label: "X", max: 10 }).ok).toBe(false);
    expect(validateBoundedText("toolong", { label: "X", max: 3 }).ok).toBe(false);
  });
});

describe("defineId", () => {
  const ProjectId = defineId<"ProjectId">("ProjectId", "proj");
  const ContentId = defineId<"ContentId">("ContentId", "cnt");

  it("parses a well-formed id", () => {
    const result = ProjectId.parse("proj_ABCDEF12");
    expect(result.ok).toBe(true);
  });

  it("rejects a wrong prefix or malformed id", () => {
    expect(ProjectId.parse("cnt_ABCDEF12").ok).toBe(false);
    expect(ProjectId.parse("proj_short").ok).toBe(false);
    expect(ProjectId.parse("nope").ok).toBe(false);
  });

  it("keeps different id kinds from being interchangeable at runtime", () => {
    // A content id string is not a valid project id.
    expect(ProjectId.parse("cnt_ABCDEF12").ok).toBe(false);
    expect(ContentId.parse("cnt_ABCDEF12").ok).toBe(true);
  });
});

describe("defineStateMachine", () => {
  type S = "DRAFT" | "ACTIVE" | "DONE";
  const machine = defineStateMachine<S>({
    DRAFT: ["ACTIVE"],
    ACTIVE: ["DONE"],
    DONE: [],
  });

  it("permits legal transitions", () => {
    expect(machine.can("DRAFT", "ACTIVE")).toBe(true);
    expect(machine.assert("Thing", "ACTIVE", "DONE")).toEqual({ ok: true, value: "DONE" });
  });

  it("rejects illegal transitions with a typed error", () => {
    expect(machine.can("DONE", "ACTIVE")).toBe(false);
    const result = machine.assert("Thing", "DRAFT", "DONE");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(InvalidStateTransitionError);
      expect(result.error.from).toBe("DRAFT");
      expect(result.error.to).toBe("DONE");
    }
  });
});
