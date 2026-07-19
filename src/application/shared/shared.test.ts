import { describe, expect, it } from "vitest";
import { OwnerId } from "@/domain/project";
import { attempt } from "./attempt";
import { ensureOwner } from "./authorization";
import { systemClock } from "./clock";
import { NotAuthorizedError, RepositoryError } from "./errors";
import { createIdGenerator } from "./id-generator";

describe("systemClock", () => {
  it("returns a Date", () => {
    expect(systemClock.now()).toBeInstanceOf(Date);
  });
});

describe("createIdGenerator", () => {
  it("produces prefixed ids that pass domain id validation", () => {
    const id = createIdGenerator().generate(OwnerId.prefix);
    expect(OwnerId.parse(id).ok).toBe(true);
  });
});

describe("ensureOwner", () => {
  it("permits the owner and denies others", () => {
    const owner = OwnerId.unsafe("usr_00000001");
    const other = OwnerId.unsafe("usr_00000002");
    expect(ensureOwner(owner, owner, "x").ok).toBe(true);
    const denied = ensureOwner(other, owner, "x");
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toBeInstanceOf(NotAuthorizedError);
  });
});

describe("attempt", () => {
  it("wraps a successful operation", async () => {
    const result = await attempt("op", async () => 42);
    expect(result).toEqual({ ok: true, value: 42 });
  });

  it("translates a thrown failure into a safe RepositoryError", async () => {
    const result = await attempt("op", async () => {
      throw new Error("secret db detail");
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(RepositoryError);
      // The raw cause is never exposed in the safe message.
      expect(result.error.message).not.toContain("secret db detail");
    }
  });
});
