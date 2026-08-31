ALTER TABLE "decision_evidence"
ADD COLUMN "evidence_reference_id" TEXT;

CREATE INDEX "decision_evidence_evidence_reference_id_idx"
ON "decision_evidence"("evidence_reference_id");

ALTER TABLE "decision_evidence"
ADD CONSTRAINT "decision_evidence_evidence_reference_id_fkey"
FOREIGN KEY ("evidence_reference_id") REFERENCES "evidence_references"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
