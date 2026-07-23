import { type Brand, defineId } from "@/domain/shared";

export type EvidenceReferenceId = Brand<string, "EvidenceReferenceId">;
export const EvidenceReferenceId = defineId<"EvidenceReferenceId">("EvidenceReferenceId", "evref");
