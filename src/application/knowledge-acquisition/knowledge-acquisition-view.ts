import type {
  AcquisitionRun,
  KnowledgeObservation,
  KnowledgeReview,
  KnowledgeSource,
  SourceDocument,
} from "@/domain/knowledge-acquisition";
export type KnowledgeSourceView = Omit<KnowledgeSource, "ownerId">;
export type SourceDocumentView = Omit<SourceDocument, "ownerId">;
export type AcquisitionRunView = Omit<AcquisitionRun, "ownerId">;
export type KnowledgeObservationView = Omit<KnowledgeObservation, "ownerId">;
export type KnowledgeReviewView = Omit<KnowledgeReview, "ownerId">;
const withoutOwner = <T extends { ownerId: unknown }>(value: T): Omit<T, "ownerId"> => {
  const { ownerId, ...view } = value;
  void ownerId;
  return view;
};
export const toKnowledgeSourceView = (v: KnowledgeSource): KnowledgeSourceView => withoutOwner(v);
export const toSourceDocumentView = (v: SourceDocument): SourceDocumentView => withoutOwner(v);
export const toAcquisitionRunView = (v: AcquisitionRun): AcquisitionRunView => withoutOwner(v);
export const toKnowledgeObservationView = (v: KnowledgeObservation): KnowledgeObservationView =>
  withoutOwner(v);
export const toKnowledgeReviewView = (v: KnowledgeReview): KnowledgeReviewView => withoutOwner(v);
