import { describe, expect, it } from "vitest";
import { TranscriptDocumentId, TranscriptSegmentId } from "@/domain/media-transcript";
import { DeterministicGroundedAnalyzer } from "./deterministic-grounded-analyzer";

const documentId = TranscriptDocumentId.unsafe("trdoc_00000001");
const segment = (id: string, sequence: number, text: string) => ({
  transcriptDocumentId: documentId,
  transcriptSegmentId: TranscriptSegmentId.unsafe(id),
  transcriptTitle: "Interview",
  sequence,
  speakerLabel: "Speaker",
  text,
  startMs: sequence * 1000,
  endMs: sequence * 1000 + 900,
});

describe("DeterministicGroundedAnalyzer", () => {
  it("returns deterministic claims and grounds every claim in supplied segments", async () => {
    const analyzer = new DeterministicGroundedAnalyzer();
    const segments = [
      segment("trseg_00000001", 0, "Community is why we kept building this place together."),
      segment("trseg_00000002", 1, "The work matters because community comes back every week."),
      segment("trseg_00000003", 2, "We want every guest to feel part of the community."),
    ];
    const first = await analyzer.analyze({ segments });
    const second = await analyzer.analyze({ segments });
    expect(second).toEqual(first);
    expect(first.outputs.some((output) => output.kind === "THEME")).toBe(true);
    expect(first.recommendations).toHaveLength(1);
    const validIds = new Set(segments.map((item) => item.transcriptSegmentId));
    for (const claim of [...first.outputs, ...first.recommendations]) {
      expect(claim.sourceSegmentIds.length).toBeGreaterThan(0);
      expect(claim.sourceSegmentIds.every((id) => validIds.has(id))).toBe(true);
    }
  });
});
