import { err, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import type {
  AcquisitionRun,
  AcquisitionRunId,
  AcquisitionRunRepository,
  KnowledgeObservation,
  KnowledgeObservationId,
  KnowledgeObservationRepository,
  KnowledgeSourceId,
  KnowledgeSourceRepository,
} from "@/domain/knowledge-acquisition";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
async function owned<T extends { ownerId: OwnerId }>(
  load: Promise<Result<T | null, RepositoryError>>,
  actorId: OwnerId,
  name: string,
  id: string,
  action: string,
): Promise<Result<T, NotFoundError | NotAuthorizedError | RepositoryError>> {
  const result = await load;
  if (!result.ok) return result;
  if (!result.value) return err(new NotFoundError(name, id));
  const auth = ensureOwner(actorId, result.value.ownerId, action);
  return auth.ok ? { ok: true, value: result.value } : auth;
}
export const loadOwnedKnowledgeSource = (
  repo: KnowledgeSourceRepository,
  actorId: OwnerId,
  id: KnowledgeSourceId,
  action: string,
) =>
  owned(
    attempt("knowledgeSource.findById", () => repo.findById(id)),
    actorId,
    "KnowledgeSource",
    id,
    action,
  );
export const loadOwnedAcquisitionRun = (
  repo: AcquisitionRunRepository,
  actorId: OwnerId,
  id: AcquisitionRunId,
  action: string,
) =>
  owned(
    attempt("acquisitionRun.findById", () => repo.findById(id)),
    actorId,
    "AcquisitionRun",
    id,
    action,
  ) as Promise<Result<AcquisitionRun, NotFoundError | NotAuthorizedError | RepositoryError>>;
export const loadOwnedObservation = (
  repo: KnowledgeObservationRepository,
  actorId: OwnerId,
  id: KnowledgeObservationId,
  action: string,
) =>
  owned(
    attempt("knowledgeObservation.findById", () => repo.findById(id)),
    actorId,
    "KnowledgeObservation",
    id,
    action,
  ) as Promise<Result<KnowledgeObservation, NotFoundError | NotAuthorizedError | RepositoryError>>;
