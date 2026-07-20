import { describe, expect, it } from "vitest";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import { InMemoryIdentityRepository } from "../../../test/adapters/in-memory-identity-repository";
import { AccountDisabledError } from "./errors";
import { resolveAuthenticatedActor } from "./resolve-authenticated-actor";
import type { VerifiedPrincipal } from "./verified-principal";

function deps() {
  return {
    identity: new InMemoryIdentityRepository(),
    clock: new FixedClock(new Date("2026-07-19T00:00:00.000Z")),
    ids: new SequentialIdGenerator(),
  };
}

const principal: VerifiedPrincipal = {
  provider: "SUPABASE",
  subject: "provider-subject-uuid-1",
  email: "Chef@Example.com",
};

describe("resolveAuthenticatedActor", () => {
  it("provisions a new internal user and derives a matching owner id", async () => {
    const d = deps();
    const result = await resolveAuthenticatedActor(d, { principal });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Option A: owner id equals the internal user id, and neither is the subject.
    expect(result.value.ownerId).toBe(result.value.userId);
    expect(result.value.userId).not.toBe(principal.subject);
    expect(result.value.userId.startsWith("usr_")).toBe(true);
  });

  it("returns the SAME user for a repeat login (no duplicate provisioning)", async () => {
    const d = deps();
    const first = await resolveAuthenticatedActor(d, { principal });
    const second = await resolveAuthenticatedActor(d, { principal });
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(second.value.userId).toBe(first.value.userId);
  });

  it("is race-safe: concurrent first logins resolve to one user", async () => {
    const d = deps();
    const results = await Promise.all(
      Array.from({ length: 5 }, () => resolveAuthenticatedActor(d, { principal })),
    );
    const ids = new Set(results.map((r) => (r.ok ? r.value.userId : "err")));
    expect(ids.size).toBe(1);
  });

  it("rejects a disabled account with AccountDisabledError", async () => {
    const d = deps();
    const first = await resolveAuthenticatedActor(d, { principal });
    if (!first.ok) throw new Error("expected initial provisioning to succeed");
    d.identity.setStatus(first.value.userId, "DISABLED");
    const second = await resolveAuthenticatedActor(d, { principal });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error).toBeInstanceOf(AccountDisabledError);
  });

  it("maps distinct provider subjects to distinct internal users", async () => {
    const d = deps();
    const a = await resolveAuthenticatedActor(d, { principal });
    const b = await resolveAuthenticatedActor(d, {
      principal: { ...principal, subject: "provider-subject-uuid-2" },
    });
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.value.userId).not.toBe(b.value.userId);
  });

  it("surfaces a repository failure as a typed error, not a throw", async () => {
    const d = deps();
    d.identity.fail = true;
    const result = await resolveAuthenticatedActor(d, { principal });
    expect(result.ok).toBe(false);
  });
});
