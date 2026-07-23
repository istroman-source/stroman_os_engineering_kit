import type { EvidenceReference } from "@/domain/evidence";

export type EvidenceReferenceView = Omit<EvidenceReference, "ownerId">;

export function toEvidenceReferenceView(value: EvidenceReference): EvidenceReferenceView {
  const { ownerId, ...view } = value;
  void ownerId;
  return view;
}
