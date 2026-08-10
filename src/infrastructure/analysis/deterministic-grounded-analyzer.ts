import type {
  AnalysisSourceSegment,
  GroundedAnalysisDraft,
  GroundedEditorialAnalyzer,
} from "@/domain/analysis";

const STOP_WORDS = new Set([
  "about",
  "actually",
  "after",
  "again",
  "all",
  "also",
  "and",
  "any",
  "are",
  "because",
  "been",
  "before",
  "being",
  "but",
  "can",
  "come",
  "could",
  "did",
  "does",
  "doing",
  "for",
  "from",
  "get",
  "getting",
  "going",
  "got",
  "had",
  "has",
  "have",
  "here",
  "how",
  "into",
  "its",
  "just",
  "know",
  "like",
  "more",
  "not",
  "now",
  "one",
  "only",
  "our",
  "out",
  "really",
  "said",
  "say",
  "says",
  "some",
  "that",
  "the",
  "their",
  "there",
  "they",
  "thing",
  "things",
  "think",
  "this",
  "through",
  "too",
  "unknown",
  "very",
  "want",
  "was",
  "well",
  "were",
  "what",
  "when",
  "where",
  "which",
  "will",
  "with",
  "would",
  "yeah",
  "yes",
  "you",
  "your",
]);

const LOW_SIGNAL_CUES = [
  /^(?:(?:slate|scene\s+(?:\d+[a-z]?|[a-z]\d+|one|two|three|four|five|six|seven|eight|nine|ten)|take\s+(?:\d+[a-z]?|[a-z]\d+|one|two|three|four|five|six|seven|eight|nine|ten)|test|testing)[\s,.:!-]*)+$/i,
  /^(?:camera(?: rolling)?|sound(?: speed)?|marker|rolling|speed)[.! ]*$/i,
  /^(?:cut|thanks?|thank you|okay|ok|all right|right|yeah|yes|that(?:'s| is) (?:all|it)|we(?:'re| are) done)[.! ]*$/i,
  /^(?:okay|ok|all right|right|yeah|yes)[,!. ]+(?:thanks?|thank you)[,!. ]+(?:that(?:'s| is) (?:all|it)|we(?:'re| are) done)[.! ]*$/i,
];

const STORY_SIGNALS = [
  /\b(?:after|before|eventually|finally|first|later|now|started|then|until|used to)\b/i,
  /\b(?:adapt|arriv|becam|begin|chang|contribut|decid|discover|learn|realiz|remember|struggl)\w*\b/i,
  /\b(?:afraid|barrier|belong|could not|couldn't|felt|foundation|had to|needed|proud|wanted)\b/i,
  /\b(?:because|but|despite|however|instead|so that|which meant)\b/i,
];

interface PreparedSegment {
  readonly source: AnalysisSourceSegment;
  readonly text: string;
  readonly words: readonly string[];
  readonly score: number;
  readonly storySignalCount: number;
}

function cleanText(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(?:\[)?(?:unknown|unidentified)(?: speaker)?(?:\])?\s*:\s*/i, "")
    .replace(/^speaker(?:\s+(?:\d+|[a-z]))?\s*:\s*/i, "")
    .trim();
}

function significantWords(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? [])
    .map((word) => word.replace(/'s$/, ""))
    .filter((word) => !STOP_WORDS.has(word));
}

function storySignalCount(text: string): number {
  return STORY_SIGNALS.filter((pattern) => pattern.test(text)).length;
}

function isLowSignal(text: string): boolean {
  return text.length === 0 || LOW_SIGNAL_CUES.some((pattern) => pattern.test(text));
}

function prepare(segment: AnalysisSourceSegment): PreparedSegment {
  const text = cleanText(segment.text);
  const words = significantWords(text);
  const signals = storySignalCount(text);
  const score =
    Math.min(new Set(words).size, 12) * 2 +
    signals * 5 +
    (text.length >= 35 && text.length <= 500 ? 2 : 0) -
    (isLowSignal(text) ? 100 : 0);
  return { source: segment, text, words, score, storySignalCount: signals };
}

function displaySpeaker(label: string | null): string | null {
  const normalized = label?.trim() ?? "";
  return /^(?:unknown|unidentified(?: speaker)?|speaker(?:\s+(?:\d+|[a-z]))?)$/i.test(normalized)
    ? null
    : normalized || null;
}

function truncateAtBoundary(text: string, max: number): string {
  if (text.length <= max) return text;
  const prefix = text.slice(0, max - 1);
  const sentenceBoundary = Math.max(
    prefix.lastIndexOf(". "),
    prefix.lastIndexOf("? "),
    prefix.lastIndexOf("! "),
  );
  const boundary =
    sentenceBoundary >= Math.floor(max * 0.55) ? sentenceBoundary + 1 : prefix.lastIndexOf(" ");
  const clipped = prefix
    .slice(0, boundary > 0 ? boundary : prefix.length)
    .replace(/[,:;.!?\s-]+$/, "");
  return `${clipped}…`;
}

function excerpt(segment: PreparedSegment, max = 220): string {
  const text = truncateAtBoundary(segment.text, max);
  const speaker = displaySpeaker(segment.source.speakerLabel);
  return speaker ? `${speaker}: “${text}”` : `“${text}”`;
}

function repeatedWords(segments: readonly PreparedSegment[]): string[] {
  const counts = new Map<string, { occurrences: number; segments: number }>();
  for (const segment of segments) {
    const unique = new Set(segment.words);
    for (const word of segment.words) {
      const current = counts.get(word) ?? { occurrences: 0, segments: 0 };
      current.occurrences += 1;
      counts.set(word, current);
    }
    for (const word of unique) counts.get(word)!.segments += 1;
  }
  return [...counts]
    .filter(([, count]) => count.segments >= 2)
    .sort(
      ([a, ac], [b, bc]) =>
        bc.segments - ac.segments || bc.occurrences - ac.occurrences || a.localeCompare(b),
    )
    .slice(0, 3)
    .map(([word]) => word);
}

function selectProgression(segments: readonly PreparedSegment[]): PreparedSegment[] {
  const signaled = segments
    .filter((segment) => segment.storySignalCount > 0)
    .sort((a, b) => a.source.sequence - b.source.sequence);
  if (signaled.length <= 3) return signaled;
  const middle = signaled
    .slice(1, -1)
    .sort((a, b) => b.score - a.score || a.source.sequence - b.source.sequence)[0]!;
  return [signaled[0]!, middle, signaled.at(-1)!].sort(
    (a, b) => a.source.sequence - b.source.sequence,
  );
}

/**
 * A transparent, offline baseline. Direct observations preserve source language;
 * themes and progressions are explicitly framed as editorial hypotheses. Every
 * output remains tied to supplied transcript IDs and under filmmaker authority.
 */
export class DeterministicGroundedAnalyzer implements GroundedEditorialAnalyzer {
  async analyze(input: {
    readonly segments: readonly AnalysisSourceSegment[];
  }): Promise<GroundedAnalysisDraft> {
    if (input.segments.length === 0) {
      return { outputs: [], recommendations: [] };
    }

    const prepared = input.segments.map(prepare);
    const substantive = prepared.filter((segment) => segment.score >= 0 && segment.text.length > 0);
    if (substantive.length === 0) {
      return { outputs: [], recommendations: [] };
    }
    const candidates = substantive;
    const strongest = [...candidates]
      .sort((a, b) => b.score - a.score || a.source.sequence - b.source.sequence)
      .slice(0, 3);
    const words = repeatedWords(candidates);
    const themeSources = words.length
      ? candidates
          .filter((segment) => segment.words.some((word) => words.includes(word)))
          .slice(0, 4)
      : [];
    const progression = selectProgression(candidates);
    const recommendationSources = progression.length >= 2 ? progression : strongest;
    const themeClause = words.length
      ? ` Repeated source language includes ${words.join(", ")}.`
      : "";

    return {
      outputs: [
        ...strongest.map((segment) => ({
          kind: "OBSERVATION" as const,
          content: excerpt(segment),
          confidence: 1,
          sourceSegmentIds: [segment.source.transcriptSegmentId],
        })),
        ...(words.length
          ? [
              {
                kind: "THEME" as const,
                content: `Possible theme to explore: ${words.join(", ")} recur across ${themeSources.length} substantive moments. Repetition is evidence for a pattern, not proof of editorial importance.`,
                confidence: 0.64,
                sourceSegmentIds: themeSources.map((segment) => segment.source.transcriptSegmentId),
              },
            ]
          : []),
        ...(progression.length >= 2
          ? [
              {
                kind: "NARRATIVE" as const,
                content: `Possible source-backed progression (interpretation): ${progression
                  .map((segment) => excerpt(segment, 120))
                  .join(
                    " → ",
                  )}. Confirm that this connection remains truthful in the fuller context.`,
                confidence: 0.58,
                sourceSegmentIds: progression.map((segment) => segment.source.transcriptSegmentId),
              },
            ]
          : []),
      ],
      recommendations: [
        {
          title:
            progression.length >= 2
              ? "Test the source-backed progression as an editorial spine"
              : "Test the most specific source-backed moments as an editorial spine",
          rationale:
            progression.length >= 2
              ? `Why it may matter: connecting these moments could give the audience a legible sense of change instead of a chronology of isolated quotes.${themeClause} This is an editorial hypothesis: verify context, look for counter-evidence, and keep, revise, or reject it under filmmaker judgment.`
              : `Why it may matter: these moments contain the transcript's most concrete substantive language.${themeClause} Test whether they serve the project intent, look for counter-evidence, and reject the hypothesis if fuller context does not support it; length and repetition alone do not make them important. The filmmaker decides what belongs in the story.`,
          confidence: progression.length >= 2 ? 0.68 : 0.6,
          sourceSegmentIds: recommendationSources.map(
            (segment) => segment.source.transcriptSegmentId,
          ),
        },
      ],
    };
  }
}
