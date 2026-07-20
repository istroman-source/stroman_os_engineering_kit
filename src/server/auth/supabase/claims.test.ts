import { describe, expect, it } from "vitest";
import { principalFromClaims } from "./claims";

describe("principalFromClaims", () => {
  it("builds a SUPABASE principal from a subject + email", () => {
    const principal = principalFromClaims({ sub: "abc-123", email: "chef@example.com" });
    expect(principal).toEqual({
      provider: "SUPABASE",
      subject: "abc-123",
      email: "chef@example.com",
    });
  });

  it("allows a missing email (null)", () => {
    expect(principalFromClaims({ sub: "abc-123" })?.email).toBeNull();
    expect(principalFromClaims({ sub: "abc-123", email: "" })?.email).toBeNull();
  });

  it("rejects claims without a usable subject", () => {
    expect(principalFromClaims({})).toBeNull();
    expect(principalFromClaims({ sub: "" })).toBeNull();
    expect(principalFromClaims({ sub: 42 })).toBeNull();
  });
});
