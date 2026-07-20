import { describe, expect, it } from "vitest";
import { safeInternalPath } from "./redirect-safety";

describe("safeInternalPath", () => {
  it("allows plain rooted internal paths", () => {
    expect(safeInternalPath("/projects")).toBe("/projects");
    expect(safeInternalPath("/projects/abc-123")).toBe("/projects/abc-123");
  });

  it("falls back for open-redirect attempts", () => {
    expect(safeInternalPath("//evil.com")).toBe("/projects");
    expect(safeInternalPath("/\\evil.com")).toBe("/projects");
    expect(safeInternalPath("https://evil.com")).toBe("/projects");
    expect(safeInternalPath("http://evil.com")).toBe("/projects");
    expect(safeInternalPath("javascript:alert(1)")).toBe("/projects");
    expect(safeInternalPath("/path?next=//evil.com")).toBe("/projects");
    expect(safeInternalPath("relative")).toBe("/projects");
  });

  it("falls back for missing/empty values and honors a custom fallback", () => {
    expect(safeInternalPath(null)).toBe("/projects");
    expect(safeInternalPath(undefined)).toBe("/projects");
    expect(safeInternalPath("", "/dashboard")).toBe("/dashboard");
  });
});
