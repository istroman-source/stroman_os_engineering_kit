import { describe, expect, it } from "vitest";
import { sampleVideoTimestamps } from "./video-frame-extractor";

describe("sampleVideoTimestamps", () => {
  it("spreads a bounded sample across the usable duration", () => {
    const values = sampleVideoTimestamps(10, 5);
    expect(values).toHaveLength(5);
    expect(values[0]).toBeGreaterThan(0);
    expect(values.at(-1)).toBeLessThan(10);
    expect(values).toEqual([...values].sort((a, b) => a - b));
  });

  it("rejects unknown durations and clamps sample count", () => {
    expect(sampleVideoTimestamps(Number.POSITIVE_INFINITY)).toEqual([]);
    expect(sampleVideoTimestamps(2, 20)).toHaveLength(6);
    expect(sampleVideoTimestamps(2, 1)).toHaveLength(2);
  });
});
