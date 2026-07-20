import { describe, expect, it } from "vitest";
import { isAllowedOrigin, isUnsafeMethod } from "./origin";

const ALLOWED = ["https://app.example.com"];

describe("isUnsafeMethod", () => {
  it("treats GET/HEAD/OPTIONS as safe and others as unsafe", () => {
    expect(isUnsafeMethod("GET")).toBe(false);
    expect(isUnsafeMethod("head")).toBe(false);
    expect(isUnsafeMethod("OPTIONS")).toBe(false);
    expect(isUnsafeMethod("POST")).toBe(true);
    expect(isUnsafeMethod("delete")).toBe(true);
  });
});

describe("isAllowedOrigin", () => {
  it("accepts an allowlisted origin", () => {
    expect(isAllowedOrigin("https://app.example.com", ALLOWED)).toBe(true);
  });

  it("rejects a foreign origin", () => {
    expect(isAllowedOrigin("https://evil.example.com", ALLOWED)).toBe(false);
  });

  it("fails closed on a missing origin", () => {
    expect(isAllowedOrigin(null, ALLOWED)).toBe(false);
    expect(isAllowedOrigin("", ALLOWED)).toBe(false);
  });
});
