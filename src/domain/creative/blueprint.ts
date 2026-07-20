import type { CreativeBrief } from "./creative-brief";

/** A single hook concept the creator can open the piece with. */
export interface HookConcept {
  readonly title: string;
  readonly description: string;
}

/**
 * The Creative Blueprint: Stroman OS's structured reading of a project's context,
 * produced before editing begins. Pure data so it can be regenerated
 * deterministically from a brief and serialized without transformation.
 */
export interface Blueprint {
  readonly projectSummary: string;
  readonly storyObjective: string;
  readonly audienceAnalysis: string;
  readonly emotionalArc: readonly string[];
  readonly recommendedStructure: string;
  readonly hookConcepts: readonly HookConcept[];
  readonly editingBlueprint: readonly string[];
  /** null when interviews are not applicable to this format. */
  readonly interviewStrategy: readonly string[] | null;
  readonly brollPriorities: readonly string[];
  readonly risks: readonly string[];
  readonly masterPrompt: string;
}

function matches(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

function isShortForm(projectType: string): boolean {
  return matches(projectType, /reel|short|social|tiktok|promo|teaser|ad|spot|trailer/i);
}

function interviewApplies(brief: CreativeBrief): boolean {
  return matches(
    `${brief.projectType} ${brief.creativeGoal} ${brief.context}`,
    /interview|documentary|testimonial|brand story|profile|founder|customer story|q&a|talking head/i,
  );
}

/**
 * Turn a creative brief into a Creative Blueprint. This is the deterministic,
 * rule-based reasoning engine — the seam a provider-backed engine can later sit
 * behind. Given the same brief it always produces the same blueprint.
 */
export function generateBlueprint(brief: CreativeBrief): Blueprint {
  const shortForm = isShortForm(brief.projectType);

  const projectSummary =
    `“${brief.title}” is a ${brief.projectType.toLowerCase()} project for ${brief.client}. ` +
    `The creative goal is to ${brief.creativeGoal.trim().replace(/\.$/, "")}, ` +
    `reaching ${brief.targetAudience} and leaving them feeling ${brief.desiredEmotion.toLowerCase()}.`;

  const storyObjective =
    `Every creative choice should serve one objective: ${brief.creativeGoal.trim().replace(/\.$/, "")}. ` +
    `Success looks like the audience feeling ${brief.desiredEmotion.toLowerCase()} and acting on it.`;

  const audienceAnalysis =
    `Primary audience: ${brief.targetAudience}. ` +
    `Speak to what they already care about, open in their world, and earn attention in the first seconds. ` +
    `Tone and pacing should track how this audience actually watches ${brief.projectType.toLowerCase()} content.`;

  const emotionalArc = [
    `Setup — establish context and signal the promise of feeling ${brief.desiredEmotion.toLowerCase()}.`,
    `Tension — introduce the stakes or contrast that make the payoff matter.`,
    `Payoff — deliver the ${brief.desiredEmotion.toLowerCase()} beat and resolve the promise.`,
  ];

  const recommendedStructure = shortForm
    ? "Hook-led short-form structure: cold-open hook → rapid context → single core idea → payoff → call to action. Keep one message; cut everything that doesn't serve it."
    : interviewApplies(brief)
      ? "Three-act documentary structure: Act I sets the person/premise and stakes, Act II develops tension through story and evidence, Act III resolves with the emotional payoff and takeaway."
      : "Three-act structure: setup (context + stakes), development (rising tension), resolution (payoff + takeaway).";

  const hookConcepts: HookConcept[] = [
    {
      title: "Result-first hook",
      description: `Open on the most striking outcome or image tied to “${brief.title}”, then rewind to show how it happened.`,
    },
    {
      title: "Tension hook",
      description: `Lead with the problem or question your audience (${brief.targetAudience}) feels most, and promise the resolution.`,
    },
    {
      title: "Emotion-first hook",
      description: `Start in the ${brief.desiredEmotion.toLowerCase()} moment — put the feeling on screen in the first two seconds before any exposition.`,
    },
  ];

  const editingBlueprint = shortForm
    ? [
        "Cut the first 3 seconds ruthlessly — the hook must land immediately.",
        "One idea per cut; remove any shot that doesn't advance the single message.",
        "Match pacing to the platform; keep momentum with motion, sound design, and captions.",
        `Land the final beat on the ${brief.desiredEmotion.toLowerCase()} payoff, then the call to action.`,
      ]
    : [
        "Open on the strongest hook, not the chronological beginning.",
        "Sequence for emotional escalation, not just chronology.",
        `Use sound and music to underline the ${brief.desiredEmotion.toLowerCase()} arc.`,
        "Reserve the most powerful visual for the payoff; earn it.",
      ];

  const interviewStrategy = interviewApplies(brief)
    ? [
        "Pre-interview to find the real story before rolling; note the exact quotes you need.",
        `Ask questions that surface ${brief.desiredEmotion.toLowerCase()} — feelings and turning points, not just facts.`,
        "Ask subjects to answer in full sentences that restate the question, so clips stand alone.",
        "Capture room tone and reaction shots for flexible editing.",
      ]
    : null;

  const brollPriorities = [
    `Signature visuals that establish ${brief.client} and the world of “${brief.title}”.`,
    "Detail/insert shots that make the core idea tangible.",
    `Moments that visually carry the ${brief.desiredEmotion.toLowerCase()} beat.`,
    "Transitional motion (movement, hands, environment) to sustain pace.",
  ];

  const risks = [
    `Diluting the single message — protect the goal: ${brief.creativeGoal.trim().replace(/\.$/, "")}.`,
    "A weak or slow open; the hook is the highest-leverage edit.",
    `Missing the target emotion — verify each act moves toward ${brief.desiredEmotion.toLowerCase()}.`,
    `Losing the audience (${brief.targetAudience}) with insider references or pacing that doesn't fit the format.`,
  ];

  const masterPrompt = [
    `You are a senior creative director editing “${brief.title}” for ${brief.client}.`,
    `Format: ${brief.projectType}.`,
    `Goal: ${brief.creativeGoal}.`,
    `Audience: ${brief.targetAudience}.`,
    `Desired emotion: ${brief.desiredEmotion}.`,
    `Context: ${brief.context}.`,
    `Recommend the edit that best achieves the goal and lands the desired emotion, and justify each major choice.`,
  ].join("\n");

  return {
    projectSummary,
    storyObjective,
    audienceAnalysis,
    emotionalArc,
    recommendedStructure,
    hookConcepts,
    editingBlueprint,
    interviewStrategy,
    brollPriorities,
    risks,
    masterPrompt,
  };
}
