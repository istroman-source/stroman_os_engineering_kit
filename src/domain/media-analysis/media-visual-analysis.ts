export interface VisualAnalysisFrame {
  readonly index: number;
  readonly timestampMs: number;
  readonly mimeType: "image/jpeg" | "image/png" | "image/webp";
  readonly bytes: Uint8Array;
}

export interface VisualMediaAnalysisInput {
  readonly sourceName: string;
  readonly projectContext: string | null;
  readonly frames: readonly VisualAnalysisFrame[];
}

export interface VisualMediaObservation {
  readonly frameIndex: number;
  readonly description: string;
  readonly confidence: number;
}

export interface VisualMediaInterpretation {
  readonly frameIndices: readonly number[];
  readonly content: string;
  readonly confidence: number;
}

export interface VisualMediaRecommendation {
  readonly frameIndices: readonly number[];
  readonly title: string;
  readonly rationale: string;
  readonly confidence: number;
}

export interface VisualMediaAnalysisDraft {
  readonly observations: readonly VisualMediaObservation[];
  readonly interpretations: readonly VisualMediaInterpretation[];
  readonly recommendations: readonly VisualMediaRecommendation[];
  readonly unknowns: readonly string[];
}

/** Provider-neutral port for understanding representative frames from captured media. */
export interface VisualMediaAnalyzer {
  readonly id: string;
  readonly mode: "HOSTED" | "DETERMINISTIC";
  analyze(input: VisualMediaAnalysisInput): Promise<VisualMediaAnalysisDraft>;
}

export class VisualMediaAnalysisError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "VisualMediaAnalysisError";
  }
}
