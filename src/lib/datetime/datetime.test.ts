import { describe, expect, it } from "vitest";
import { addDays, differenceInDays, isoDateOnly, nowIso, parseIso, toIso } from "./datetime";

const FIXED = new Date("2026-07-17T12:00:00.000Z");

describe("datetime", () => {
  it("uses an injectable clock for now", () => {
    expect(nowIso(() => FIXED)).toBe("2026-07-17T12:00:00.000Z");
  });

  it("round-trips ISO strings", () => {
    const parsed = parseIso("2026-07-17T12:00:00.000Z");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(toIso(parsed.value)).toBe("2026-07-17T12:00:00.000Z");
  });

  it("returns an error for invalid ISO input", () => {
    const parsed = parseIso("not-a-date");
    expect(parsed.ok).toBe(false);
  });

  it("adds days and computes differences", () => {
    const later = addDays(FIXED, 3);
    expect(isoDateOnly(later)).toBe("2026-07-20");
    expect(differenceInDays(later, FIXED)).toBe(3);
    expect(differenceInDays(FIXED, later)).toBe(-3);
  });

  it("extracts the date-only portion", () => {
    expect(isoDateOnly(FIXED)).toBe("2026-07-17");
  });
});
