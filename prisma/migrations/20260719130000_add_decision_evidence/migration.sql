-- CreateTable
CREATE TABLE "decision_evidence" (
    "decision_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "source_label" TEXT NOT NULL,
    "observation" TEXT NOT NULL,
    "relevance" TEXT NOT NULL,

    CONSTRAINT "decision_evidence_pkey" PRIMARY KEY ("decision_id","position")
);

-- AddForeignKey
ALTER TABLE "decision_evidence" ADD CONSTRAINT "decision_evidence_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "decisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
