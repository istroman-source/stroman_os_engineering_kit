import { describe, expect, it } from "vitest";
import { TranscriptDocumentId, TranscriptSegmentId } from "@/domain/media-transcript";
import { DeterministicGroundedAnalyzer } from "./deterministic-grounded-analyzer";

const documentId = TranscriptDocumentId.unsafe("trdoc_00000001");
const segment = (
  id: string,
  sequence: number,
  text: string,
  speakerLabel: string | null = "Speaker",
) => ({
  transcriptDocumentId: documentId,
  transcriptSegmentId: TranscriptSegmentId.unsafe(id),
  transcriptTitle: "Interview",
  sequence,
  speakerLabel,
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

  it("ignores slate chatter and generic speaker metadata while proposing a grounded progression", async () => {
    const result = await new DeterministicGroundedAnalyzer().analyze({
      segments: [
        segment("trseg_00000010", 0, "Scene one, take two. Testing, testing.", "Unknown"),
        segment(
          "trseg_00000015",
          1,
          "PRODUCTION: Scene four, take two. Hold for room tone.",
          "Unknown",
        ),
        segment(
          "trseg_00000011",
          2,
          "When I first arrived, the environment was unfamiliar and I could not speak the language.",
          "Unknown",
        ),
        segment(
          "trseg_00000012",
          3,
          "I had to start at the bottom, but over time I learned how the whole operation worked.",
          "Unknown",
        ),
        segment(
          "trseg_00000013",
          4,
          "Eventually I could contribute, and now our work has become part of the foundation here.",
          "Unknown",
        ),
        segment("trseg_00000014", 5, "Okay, thanks, that's all.", "Unknown"),
      ],
    });

    const rendered = result.outputs
      .map((output) => output.content)
      .join(" ")
      .toLowerCase();
    expect(rendered).not.toContain("unknown");
    expect(rendered).not.toContain("testing, testing");
    expect(rendered).not.toContain("hold for room tone");
    expect(rendered).not.toContain("thanks, that's all");
    expect(rendered).not.toContain("unknown, know, say");
    expect(rendered).toContain("possible source-backed progression");
    expect(rendered).toContain("first arrived");
    expect(rendered).toContain("foundation");
    expect(result.outputs.find((output) => output.kind === "NARRATIVE")?.confidence).toBeLessThan(
      1,
    );
    expect(result.recommendations[0]?.rationale).toContain("Why it may matter");
    expect(result.recommendations[0]?.rationale).toContain("filmmaker judgment");
  });

  it("truncates source excerpts at a word boundary", async () => {
    const longText = `${"Specific craft detail ".repeat(18)}ends with a complete thought.`;
    const result = await new DeterministicGroundedAnalyzer().analyze({
      segments: [segment("trseg_00000020", 0, longText, "Director")],
    });
    const observation = result.outputs.find((output) => output.kind === "OBSERVATION");

    expect(observation?.content).toMatch(/…”$/);
    expect(observation?.content).not.toContain("detai…");
  });

  it("keeps substantive quotes that begin with common production cues", async () => {
    const analyzer = new DeterministicGroundedAnalyzer();
    const result = await analyzer.analyze({
      segments: [
        segment(
          "trseg_00000021",
          0,
          "Cut the toxic relationships out of my life so I could rebuild.",
          "Speaker A",
        ),
        segment(
          "trseg_00000022",
          1,
          "Testing our assumptions was the hardest part of this project.",
        ),
        segment("trseg_00000023", 2, "Thank you for believing in me when no one else did."),
      ],
    });

    const rendered = result.outputs.map((output) => output.content).join(" ");
    expect(rendered).toContain("Cut the toxic relationships");
    expect(rendered).toContain("Testing our assumptions");
    expect(rendered).toContain("Thank you for believing");
    expect(rendered).not.toContain("Speaker A");

    const imperative = await analyzer.analyze({
      segments: [
        segment("trseg_00000024", 0, "Take control of the frame and let the silence hold."),
      ],
    });
    expect(imperative.outputs[0]?.content).toContain("Take control of the frame");
    expect(imperative.recommendations[0]?.rationale).toContain("look for counter-evidence");
  });

  it("returns no editorial claims when the transcript contains only slate and closing chatter", async () => {
    await expect(
      new DeterministicGroundedAnalyzer().analyze({
        segments: [
          segment("trseg_00000030", 0, "Slate, scene one, take two.", "Unknown"),
          segment("trseg_00000031", 1, "Testing, testing.", "Unknown"),
          segment("trseg_00000032", 2, "Okay, thanks, that's all.", "Unknown"),
        ],
      }),
    ).resolves.toEqual({ outputs: [], recommendations: [] });
  });
});
