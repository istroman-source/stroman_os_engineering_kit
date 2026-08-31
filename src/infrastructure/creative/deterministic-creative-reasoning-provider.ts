import {
  generateDevelopmentBlueprint,
  type CandidateCritique,
  type CreativeBrief,
  type CreativeCandidateSet,
  type CreativeReasoningProvider,
  type MeaningfulDevelopment,
  type ProjectUnderstanding,
} from "@/domain/creative";

function meaningful(plan: ReturnType<typeof generateDevelopmentBlueprint>): MeaningfulDevelopment {
  return {
    version: plan.version,
    reasoningSource: "DETERMINISTIC_SPECIALIST",
    insight: plan.insight,
    directionDecision: plan.directionDecision,
    alternativeDecisions: plan.alternativeDecisions,
    sceneHypotheses: plan.sceneHypotheses,
    directorNotebook: plan.directorNotebook,
    storyboard: plan.storyboard,
    questions: plan.questions,
    productionNextSteps: plan.productionNextSteps,
  };
}

/** Safe offline baseline. It follows the same staged contract as hosted reasoning. */
export class DeterministicCreativeReasoningProvider implements CreativeReasoningProvider {
  readonly id = "deterministic-specialist-v2";
  readonly mode = "DETERMINISTIC" as const;

  async understand(brief: CreativeBrief): Promise<ProjectUnderstanding> {
    const plan = generateDevelopmentBlueprint(brief);
    return {
      projectSpecificReading: plan.objectiveRead,
      insight: plan.insight,
      verifiedIntent: [
        `Title: ${brief.title}`,
        `Goal: ${brief.creativeGoal || "not supplied"}`,
        `Audience: ${brief.targetAudience || "not supplied"}`,
        `Desired emotion: ${brief.desiredEmotion || "not supplied"}`,
      ],
      assumptions: plan.directionDecision.assumptions,
      constraints: [
        brief.context,
        brief.restrictions,
        brief.clientRequirements,
        brief.nonNegotiables,
      ].filter(Boolean).length
        ? [
            brief.context,
            brief.restrictions,
            brief.clientRequirements,
            brief.nonNegotiables,
          ].filter(Boolean)
        : ["Production constraints were not supplied."],
    };
  }

  async generateCandidates(brief: CreativeBrief): Promise<CreativeCandidateSet> {
    const plan = generateDevelopmentBlueprint(brief);
    return { candidates: [plan.directionDecision, ...plan.alternativeDecisions] };
  }

  async critiqueCandidates(
    brief: CreativeBrief,
    understanding: ProjectUnderstanding,
    candidates: CreativeCandidateSet,
  ): Promise<readonly CandidateCritique[]> {
    void brief;
    void understanding;
    return candidates.candidates.map((candidate) => ({
      candidateTitle: candidate.title,
      strongestReason: candidate.whyThisProject,
      failureMode: candidate.innovation?.executionRisk ?? candidate.sacrifice,
      sacrifice: candidate.sacrifice,
      changeMyMindIf: candidate.changeMyMindIf,
    }));
  }

  async synthesize(brief: CreativeBrief): Promise<MeaningfulDevelopment> {
    return meaningful(generateDevelopmentBlueprint(brief));
  }
}
