import { err } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import type { EvidenceReferenceId, EvidenceReferenceRepository } from "@/domain/evidence";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotFoundError } from "../shared/errors";

export async function loadOwnedEvidenceReference(
  repository: EvidenceReferenceRepository,
  actorId: OwnerId,
  id: EvidenceReferenceId,
  action: string,
) {
  const loaded = await attempt("evidenceReference.findById", () => repository.findById(id));
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("EvidenceReference", id));
  const authorized = ensureOwner(actorId, loaded.value.ownerId, action);
  return authorized.ok ? { ok: true as const, value: loaded.value } : authorized;
}
