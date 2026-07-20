import { type Brand, defineId } from "../shared";
import type { UserId } from "./user-id";

/** Surrogate identity of a provider-identity mapping row. */
export type UserIdentityId = Brand<string, "UserIdentityId">;
export const UserIdentityId = defineId<"UserIdentityId">("UserIdentityId", "uid");

/**
 * Authentication providers Stroman OS can map identities from. A closed set: a
 * new provider is an explicit code + migration change, never an untrusted value.
 * Supabase is the initial (and currently only) provider.
 */
export type AuthProvider = "SUPABASE";
export const AUTH_PROVIDERS: readonly AuthProvider[] = ["SUPABASE"];

/**
 * A verified mapping from an external provider identity to an internal `UserId`.
 * The `(provider, providerSubject)` pair is unique and is the ONLY key used to
 * resolve a returning user. `normalizedEmail` is retained for audit/support
 * only; it is never used as an authorization key or a stable identity, because
 * email is mutable at the provider.
 */
export interface UserIdentity {
  readonly id: UserIdentityId;
  readonly userId: UserId;
  readonly provider: AuthProvider;
  readonly providerSubject: string;
  readonly normalizedEmail: string | null;
  readonly createdAt: Date;
  readonly lastAuthenticatedAt: Date;
}
