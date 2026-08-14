import type {
  VisualMediaAnalyzer,
  VisualMediaAnalysisDraft,
  VisualMediaAnalysisInput,
} from "@/domain/media-analysis";

/**
 * Truthful offline fallback. It preserves the sampled-frame boundary without
 * pretending that byte metadata is visual understanding.
 */
export class DeterministicVisualMediaAnalyzer implements VisualMediaAnalyzer {
  readonly id = "deterministic-visual-media:v1";
  readonly mode = "DETERMINISTIC" as const;

  async analyze(input: VisualMediaAnalysisInput): Promise<VisualMediaAnalysisDraft> {
    return {
      observations: [],
      interpretations: [],
      recommendations: [],
      unknowns: [
        `${input.frames.length} representative frame${input.frames.length === 1 ? " was" : "s were"} sampled, but visual content remains unknown while hosted media reasoning is unavailable.`,
      ],
    };
  }
}
