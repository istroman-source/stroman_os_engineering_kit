import type { TranscriptDocumentId, TranscriptSegmentId } from "@/domain/media-transcript";

export interface AnalysisSourceSegment {
  readonly transcriptDocumentId: TranscriptDocumentId;
  readonly transcriptSegmentId: TranscriptSegmentId;
  readonly transcriptTitle: string;
  readonly sequence: number;
  readonly speakerLabel: string | null;
  readonly text: string;
  readonly startMs: number | null;
  readonly endMs: number | null;
}

export interface GroundedOutputDraft {
  readonly kind: "OBSERVATION" | "INFERENCE" | "THEME" | "NARRATIVE";
  readonly content: string;
  readonly confidence: number;
  readonly sourceSegmentIds: readonly TranscriptSegmentId[];
}

export interface GroundedRecommendationDraft {
  readonly title: string;
  readonly rationale: string;
  readonly confidence: number;
  readonly sourceSegmentIds: readonly TranscriptSegmentId[];
}

export interface GroundedAnalysisDraft {
  readonly outputs: readonly GroundedOutputDraft[];
  readonly recommendations: readonly GroundedRecommendationDraft[];
}

/**
 * Provider-neutral analysis seam. Implementations may be deterministic or
 * provider-backed, but may only return claims tied to supplied source segments.
 */
export interface GroundedEditorialAnalyzer {
  analyze(input: {
    readonly segments: readonly AnalysisSourceSegment[];
  }): Promise<GroundedAnalysisDraft>;
}
