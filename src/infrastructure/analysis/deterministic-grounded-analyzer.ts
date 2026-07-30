import type {
  AnalysisSourceSegment,
  GroundedAnalysisDraft,
  GroundedEditorialAnalyzer,
} from "@/domain/analysis";

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "and",
  "are",
  "because",
  "been",
  "before",
  "but",
  "can",
  "could",
  "did",
  "does",
  "for",
  "from",
  "have",
  "here",
  "into",
  "just",
  "like",
  "more",
  "not",
  "our",
  "out",
  "that",
  "the",
  "their",
  "there",
  "they",
  "this",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "with",
  "would",
  "you",
  "your",
]);

function significantWords(segments: readonly AnalysisSourceSegment[]): string[] {
  const counts = new Map<string, number>();
  for (const segment of segments) {
    for (const raw of segment.text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? []) {
      if (STOP_WORDS.has(raw)) continue;
      counts.set(raw, (counts.get(raw) ?? 0) + 1);
    }
  }
  return [...counts]
    .sort(([a, ac], [b, bc]) => bc - ac || a.localeCompare(b))
    .slice(0, 3)
    .map(([word]) => word);
}

function excerpt(segment: AnalysisSourceSegment): string {
  const text = segment.text.length > 240 ? `${segment.text.slice(0, 237)}…` : segment.text;
  return segment.speakerLabel ? `${segment.speakerLabel}: “${text}”` : `“${text}”`;
}

/**
 * A transparent, offline baseline. It makes no inferred factual claims: every
 * output is a bounded synthesis of supplied transcript text with explicit IDs.
 */
export class DeterministicGroundedAnalyzer implements GroundedEditorialAnalyzer {
  async analyze(input: {
    readonly segments: readonly AnalysisSourceSegment[];
  }): Promise<GroundedAnalysisDraft> {
    const meaningful = input.segments.filter((segment) => segment.text.trim().length >= 12);
    const candidates = meaningful.length ? meaningful : input.segments;
    const opening = candidates[0]!;
    const closing = candidates.at(-1)!;
    const strongest = [...candidates]
      .sort((a, b) => b.text.length - a.text.length || a.sequence - b.sequence)
      .slice(0, 3);
    const words = significantWords(candidates);
    const themeEvidence = candidates
      .filter((segment) => words.some((word) => segment.text.toLowerCase().includes(word)))
      .slice(0, 3);
    const themeSources = themeEvidence.length ? themeEvidence : strongest;
    return {
      outputs: [
        ...strongest.map((segment) => ({
          kind: "OBSERVATION" as const,
          content: excerpt(segment),
          confidence: 1,
          sourceSegmentIds: [segment.transcriptSegmentId],
        })),
        {
          kind: "THEME" as const,
          content: words.length
            ? `Recurring transcript language centers on ${words.join(", ")}.`
            : "The available transcript is too brief to identify recurring language.",
          confidence: words.length ? 0.7 : 0.4,
          sourceSegmentIds: themeSources.map((segment) => segment.transcriptSegmentId),
        },
        {
          kind: "NARRATIVE" as const,
          content: `The source moves from ${excerpt(opening)} to ${excerpt(closing)}.`,
          confidence: 0.75,
          sourceSegmentIds: [
            ...new Set([opening.transcriptSegmentId, closing.transcriptSegmentId]),
          ],
        },
      ],
      recommendations: [
        {
          title: "Build the first assembly around explicit source language",
          rationale:
            "Start with the strongest transcript statement, then test the recurring language as the supporting spine. This is an editorial suggestion, not a decision.",
          confidence: 0.72,
          sourceSegmentIds: strongest.map((segment) => segment.transcriptSegmentId),
        },
      ],
    };
  }
}
