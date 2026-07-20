import { err, ok, type Result } from "@/lib/result";
import type { IdentityRepository, User, UserIdentity } from "@/domain/identity";
import { UserId, UserIdentityId } from "@/domain/identity";
import { OwnerId } from "@/domain/project";
import { attempt } from "../shared/attempt";
import type { Clock, IdGenerator } from "../shared";
import type { RepositoryError } from "../shared/errors";
import type { AuthenticatedActor } from "./authenticated-actor";
import { normalizeEmail } from "./email";
import { AccountDisabledError } from "./errors";
import type { VerifiedPrincipal } from "./verified-principal";

export interface ResolveAuthenticatedActorDeps {
  readonly identity: IdentityRepository;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

export interface ResolveAuthenticatedActorInput {
  readonly principal: VerifiedPrincipal;
}

export type ResolveAuthenticatedActorResult = Result<
  AuthenticatedActor,
  AccountDisabledError | RepositoryError
>;

/**
 * Map a verified provider principal to the authorized internal actor. Race-safe
 * first-login provisioning happens in the repository; here we build the stable
 * internal identity, enforce account status, and derive the owner id server-side.
 *
 * The provider subject is NEVER used as the owner id: a fresh internal `UserId`
 * is generated and the owner id is that same stable id (Option A). A disabled
 * account is rejected before any resource access.
 */
export async function resolveAuthenticatedActor(
  deps: ResolveAuthenticatedActorDeps,
  input: ResolveAuthenticatedActorInput,
): Promise<ResolveAuthenticatedActorResult> {
  const { principal } = input;
  const now = deps.clock.now();

  const candidateUser: User = {
    id: UserId.unsafe(deps.ids.generate(UserId.prefix)),
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  };
  const candidateIdentity: UserIdentity = {
    id: UserIdentityId.unsafe(deps.ids.generate(UserIdentityId.prefix)),
    userId: candidateUser.id,
    provider: principal.provider,
    providerSubject: principal.subject,
    normalizedEmail: normalizeEmail(principal.email),
    createdAt: now,
    lastAuthenticatedAt: now,
  };

  const provisioned = await attempt("identity.provision", () =>
    deps.identity.provision({ user: candidateUser, identity: candidateIdentity }),
  );
  if (!provisioned.ok) return provisioned;

  const user = provisioned.value.user;
  if (user.status !== "ACTIVE") return err(new AccountDisabledError());

  // Owner mapping Option A: the stable internal user id IS the owner id. Values
  // share the `usr_` shape, so this is a validated re-brand, not a new identity.
  return ok({ userId: user.id, ownerId: OwnerId.unsafe(user.id) });
}
