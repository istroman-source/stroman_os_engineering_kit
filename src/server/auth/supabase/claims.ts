import type { VerifiedPrincipal } from "@/application/identity";

/**
 * Build a provider-neutral principal from ALREADY-VERIFIED Supabase JWT claims.
 * Signature, issuer, audience, and expiry are checked by the JWT verifier before
 * this runs; here we only extract and shape. Returns null if the required stable
 * subject is absent, so a malformed-but-signed token is treated as invalid rather
 * than producing an identity with no subject.
 */
export function principalFromClaims(claims: Record<string, unknown>): VerifiedPrincipal | null {
  const sub = claims.sub;
  if (typeof sub !== "string" || sub.trim() === "") return null;
  const rawEmail = claims.email;
  const email = typeof rawEmail === "string" && rawEmail.trim() !== "" ? rawEmail : null;
  return { provider: "SUPABASE", subject: sub, email };
}
