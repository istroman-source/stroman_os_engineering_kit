import { err, ok } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import type {
  AcquisitionRunId,
  AcquisitionRunRepository,
  KnowledgeObservationId,
  KnowledgeObservationRepository,
  KnowledgeReviewRepository,
  KnowledgeSourceId,
  KnowledgeSourceRepository,
  SourceDocumentId,
  SourceDocumentRepository,
} from "@/domain/knowledge-acquisition";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotFoundError } from "../shared/errors";
import {
  loadOwnedAcquisitionRun,
  loadOwnedKnowledgeSource,
  loadOwnedObservation,
} from "./knowledge-source-access";
import {
  toAcquisitionRunView,
  toKnowledgeObservationView,
  toKnowledgeReviewView,
  toKnowledgeSourceView,
  toSourceDocumentView,
} from "./knowledge-acquisition-view";
export async function getKnowledgeSource(
  deps: { knowledgeSources: KnowledgeSourceRepository },
  input: { actorId: OwnerId; knowledgeSourceId: KnowledgeSourceId },
) {
  const source = await loadOwnedKnowledgeSource(
    deps.knowledgeSources,
    input.actorId,
    input.knowledgeSourceId,
    "knowledgeSource.read",
  );
  return source.ok ? ok(toKnowledgeSourceView(source.value)) : source;
}
export async function listSourcesForOwner(
  deps: { knowledgeSources: KnowledgeSourceRepository },
  input: { actorId: OwnerId },
) {
  const r = await attempt("knowledgeSource.listByOwner", () =>
    deps.knowledgeSources.listByOwner(input.actorId),
  );
  return r.ok ? ok(r.value.map(toKnowledgeSourceView)) : r;
}
export async function listDocumentsForSource(
  deps: { knowledgeSources: KnowledgeSourceRepository; sourceDocuments: SourceDocumentRepository },
  input: { actorId: OwnerId; knowledgeSourceId: KnowledgeSourceId },
) {
  const s = await loadOwnedKnowledgeSource(
    deps.knowledgeSources,
    input.actorId,
    input.knowledgeSourceId,
    "sourceDocument.list",
  );
  if (!s.ok) return s;
  const r = await attempt("sourceDocument.listBySource", () =>
    deps.sourceDocuments.listBySource(input.knowledgeSourceId),
  );
  return r.ok ? ok(r.value.map(toSourceDocumentView)) : r;
}
export async function listRunsForSource(
  deps: { knowledgeSources: KnowledgeSourceRepository; acquisitionRuns: AcquisitionRunRepository },
  input: { actorId: OwnerId; knowledgeSourceId: KnowledgeSourceId },
) {
  const s = await loadOwnedKnowledgeSource(
    deps.knowledgeSources,
    input.actorId,
    input.knowledgeSourceId,
    "acquisitionRun.list",
  );
  if (!s.ok) return s;
  const r = await attempt("acquisitionRun.listBySource", () =>
    deps.acquisitionRuns.listBySource(input.knowledgeSourceId),
  );
  return r.ok ? ok(r.value.map(toAcquisitionRunView)) : r;
}
export async function listObservationsByRun(
  deps: {
    acquisitionRuns: AcquisitionRunRepository;
    knowledgeObservations: KnowledgeObservationRepository;
  },
  input: { actorId: OwnerId; acquisitionRunId: AcquisitionRunId },
) {
  const run = await loadOwnedAcquisitionRun(
    deps.acquisitionRuns,
    input.actorId,
    input.acquisitionRunId,
    "knowledgeObservation.listByRun",
  );
  if (!run.ok) return run;
  const r = await attempt("knowledgeObservation.listByRun", () =>
    deps.knowledgeObservations.listByRun(input.acquisitionRunId),
  );
  return r.ok ? ok(r.value.map(toKnowledgeObservationView)) : r;
}
export async function listObservationsByDocument(
  deps: {
    sourceDocuments: SourceDocumentRepository;
    knowledgeObservations: KnowledgeObservationRepository;
  },
  input: { actorId: OwnerId; sourceDocumentId: SourceDocumentId },
) {
  const d = await attempt("sourceDocument.findById", () =>
    deps.sourceDocuments.findById(input.sourceDocumentId),
  );
  if (!d.ok) return d;
  if (!d.value) return err(new NotFoundError("SourceDocument", input.sourceDocumentId));
  const auth = ensureOwner(input.actorId, d.value.ownerId, "knowledgeObservation.listByDocument");
  if (!auth.ok) return auth;
  const r = await attempt("knowledgeObservation.listByDocument", () =>
    deps.knowledgeObservations.listByDocument(input.sourceDocumentId),
  );
  return r.ok ? ok(r.value.map(toKnowledgeObservationView)) : r;
}
export async function getObservationWithReview(
  deps: {
    knowledgeObservations: KnowledgeObservationRepository;
    knowledgeReviews: KnowledgeReviewRepository;
  },
  input: { actorId: OwnerId; knowledgeObservationId: KnowledgeObservationId },
) {
  const o = await loadOwnedObservation(
    deps.knowledgeObservations,
    input.actorId,
    input.knowledgeObservationId,
    "knowledgeObservation.read",
  );
  if (!o.ok) return o;
  const r = await attempt("knowledgeReview.findByObservation", () =>
    deps.knowledgeReviews.findByObservation(input.knowledgeObservationId),
  );
  return r.ok
    ? ok({
        observation: toKnowledgeObservationView(o.value),
        review: r.value ? toKnowledgeReviewView(r.value) : null,
      })
    : r;
}
