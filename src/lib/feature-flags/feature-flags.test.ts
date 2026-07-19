import { describe, expect, it } from "vitest";
import { createFeatureFlags, parseFeatureFlags } from "./feature-flags";

describe("parseFeatureFlags", () => {
  it("parses, trims, and drops empties", () => {
    const set = parseFeatureFlags(" council_v2, , semantic_search ");
    expect([...set].sort()).toEqual(["council_v2", "semantic_search"]);
  });

  it("returns an empty set for undefined or blank", () => {
    expect(parseFeatureFlags(undefined).size).toBe(0);
    expect(parseFeatureFlags("").size).toBe(0);
  });
});

describe("createFeatureFlags", () => {
  it("reports enabled flags", () => {
    const flags = createFeatureFlags(["b", "a"]);
    expect(flags.isEnabled("a")).toBe(true);
    expect(flags.isEnabled("missing")).toBe(false);
    expect(flags.enabled()).toEqual(["a", "b"]);
  });

  it("composes with parseFeatureFlags", () => {
    const flags = createFeatureFlags(parseFeatureFlags("x,y"));
    expect(flags.isEnabled("x")).toBe(true);
    expect(flags.isEnabled("z")).toBe(false);
  });
});
