import { err, ok } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import {
  createKnowledgeObservation as createAggregate,
  KnowledgeObservationId,
  makeExtractionLocation,
  makeObservationEvidence,
  type AcquisitionRunId,
  type AcquisitionRunRepository,
  type ExtractionLocationInput,
  type KnowledgeObservationRepository,
  type KnowledgeSourceId,
  type KnowledgeSourceRepository,
  type ObservationOrigin,
  type ObservationPayload,
  type SourceDocumentId,
  type SourceDocumentRepository,
} from "@/domain/knowledge-acquisition";
import type { Clock, IdGenerator } from "../shared";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotFoundError } from "../shared/errors";
import { loadOwnedAcquisitionRun, loadOwnedKnowledgeSource } from "./knowledge-source-access";
import { toKnowledgeObservationView } from "./knowledge-acquisition-view";
export async function createKnowledgeObservation(
  deps: {
    knowledgeSources: KnowledgeSourceRepository;
    sourceDocuments: SourceDocumentRepository;
    acquisitionRuns: AcquisitionRunRepository;
    knowledgeObservations: KnowledgeObservationRepository;
    ids: IdGenerator;
    clock: Clock;
  },
  input: {
    actorId: OwnerId;
    knowledgeSourceId: KnowledgeSourceId;
    sourceDocumentId: SourceDocumentId;
    acquisitionRunId?: AcquisitionRunId | null;
    location?: ExtractionLocationInput | null;
    payload: ObservationPayload;
    createdBy: ObservationOrigin;
    confidence?: number | null;
  },
) {
  const source = await loadOwnedKnowledgeSource(
    deps.knowledgeSources,
    input.actorId,
    input.knowledgeSourceId,
    "knowledgeObservation.create",
  );
  if (!source.ok) return source;
  const documentLoad = await attempt("sourceDocument.findById", () =>
    deps.sourceDocuments.findById(input.sourceDocumentId),
  );
  if (!documentLoad.ok) return documentLoad;
  if (!documentLoad.value) return err(new NotFoundError("SourceDocument", input.sourceDocumentId));
  const docAuth = ensureOwner(
    input.actorId,
    documentLoad.value.ownerId,
    "knowledgeObservation.create",
  );
  if (!docAuth.ok) return docAuth;
  if (documentLoad.value.knowledgeSourceId !== input.knowledgeSourceId)
    return err(new NotFoundError("SourceDocument", input.sourceDocumentId));
  if (input.acquisitionRunId) {
    const run = await loadOwnedAcquisitionRun(
      deps.acquisitionRuns,
      input.actorId,
      input.acquisitionRunId,
      "knowledgeObservation.create",
    );
    if (!run.ok) return run;
    if (run.value.knowledgeSourceId !== input.knowledgeSourceId)
      return err(new NotFoundError("AcquisitionRun", input.acquisitionRunId));
  }
  const location = makeExtractionLocation(input.location ?? {});
  if (!location.ok) return location;
  const made = createAggregate({
    id: KnowledgeObservationId.unsafe(deps.ids.generate(KnowledgeObservationId.prefix)),
    ownerId: input.actorId,
    observationType: input.payload.kind,
    payload: input.payload,
    evidence: makeObservationEvidence({
      sourceDocumentId: input.sourceDocumentId,
      knowledgeSourceId: input.knowledgeSourceId,
      acquisitionRunId: input.acquisitionRunId,
      location: location.value,
    }),
    createdBy: input.createdBy,
    confidence: input.confidence,
    now: deps.clock.now(),
  });
  if (!made.ok) return made;
  const saved = await attempt("knowledgeObservation.insert", () =>
    deps.knowledgeObservations.insert(made.value),
  );
  return saved.ok ? ok(toKnowledgeObservationView(made.value)) : saved;
}
