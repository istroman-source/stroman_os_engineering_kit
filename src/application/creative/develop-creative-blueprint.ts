import { err, ok, type Result } from "@/lib/result";
import {
  CreativeQualityError,
  CreativeReasoningError,
  evaluateCreativeQuality,
  generateBlueprint,
  generateDevelopmentBlueprint,
  isMeaningfulDevelopment,
  type Blueprint,
  type CreativeBrief,
  type CreativeReasoningProvider,
} from "@/domain/creative";

export interface DevelopCreativeBlueprintDeps {
  readonly creativeReasoning: CreativeReasoningProvider;
}

export async function developCreativeBlueprint(
  deps: DevelopCreativeBlueprintDeps,
  brief: CreativeBrief,
): Promise<Result<Blueprint, CreativeReasoningError | CreativeQualityError>> {
  try {
    const understanding = await deps.creativeReasoning.understand(brief);
    const candidates = await deps.creativeReasoning.generateCandidates(brief, understanding);
    const critiques = await deps.creativeReasoning.critiqueCandidates(
      brief,
      understanding,
      candidates,
    );
    const meaningful = await deps.creativeReasoning.synthesize(
      brief,
      understanding,
      candidates,
      critiques,
    );
    if (!isMeaningfulDevelopment(meaningful)) {
      return err(
        new CreativeQualityError("Creative reasoning returned an incomplete result.", [
          "Provider output did not satisfy the meaningful-development contract.",
        ]),
      );
    }
    const quality = evaluateCreativeQuality(brief, meaningful);
    if (!quality.passed) {
      if (deps.creativeReasoning.mode === "DETERMINISTIC") {
        return err(
          new CreativeReasoningError(
            "Deep creative development is unavailable for this project until a hosted reasoning provider is configured.",
          ),
        );
      }
      return err(
        new CreativeQualityError(
          `Creative development failed the semantic quality gate (${quality.total}/100).`,
          quality.blockingFindings,
        ),
      );
    }
    const development = { ...generateDevelopmentBlueprint(brief), ...meaningful };
    return ok(generateBlueprint(brief, development));
  } catch (cause) {
    if (cause instanceof CreativeReasoningError || cause instanceof CreativeQualityError) {
      return err(cause);
    }
    return err(
      new CreativeReasoningError("Creative reasoning is temporarily unavailable.", { cause }),
    );
  }
}
