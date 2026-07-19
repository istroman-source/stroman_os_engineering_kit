import { describe, expect, it } from "vitest";
import { createId, uuid } from "./id";

describe("uuid", () => {
  it("produces valid v4-shaped UUIDs", () => {
    expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});

describe("createId", () => {
  it("uses Crockford base32 with the requested length", () => {
    const id = createId({ length: 24 });
    expect(id).toMatch(/^[0-9ABCDEFGHJKMNPQRSTVWXYZ]{24}$/);
  });

  it("applies a prefix", () => {
    expect(createId({ prefix: "proj" })).toMatch(/^proj_[0-9ABCDEFGHJKMNPQRSTVWXYZ]{24}$/);
  });

  it("is effectively unique across many calls", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => createId()));
    expect(ids.size).toBe(1000);
  });

  it("rejects non-positive lengths", () => {
    expect(() => createId({ length: 0 })).toThrowError();
  });
});
