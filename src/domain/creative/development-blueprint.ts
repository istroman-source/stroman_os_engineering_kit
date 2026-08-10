import type { CreativeBrief } from "./creative-brief";

export type CreativeMode = "DOCUMENTARY" | "COMMERCIAL" | "PERFORMANCE" | "NARRATIVE" | "OPEN";

export interface CreativeDirection {
  readonly title: string;
  readonly thesis: string;
  readonly organizingPrinciple: string;
  readonly audienceEffect: string;
  readonly execution: string;
  readonly tradeoff: string;
  readonly unconventional: boolean;
}

export interface DevelopmentQuestion {
  readonly prompt: string;
  readonly decisionItChanges: string;
}

export interface SequenceIdea {
  readonly title: string;
  readonly purpose: string;
  readonly picture: string;
  readonly sound: string;
}

export interface DirectorBlueprint {
  readonly sequenceTitle: string;
  readonly scenePurpose: string;
  readonly emotionalTarget: string;
  readonly composition: string;
  readonly blocking: string;
  readonly camera: string;
  readonly practicalsAndLighting: string;
  readonly backgroundAndDesign: string;
  readonly colorAndGrade: string;
  readonly movement: string;
  readonly soundAndAtmosphere: string;
  readonly mustGet: readonly string[];
  readonly optionalExploration: string;
  readonly risk: string;
  readonly rendering: {
    readonly capability: "STRUCTURED_BLUEPRINT_ONLY";
    readonly provider: null;
    readonly aestheticContract: "HAND_DRAWN_DIRECTOR_NOTEBOOK";
    readonly limitation: string;
  };
}

export interface DevelopmentBlueprint {
  readonly basis: "PROJECT_INTENT_ONLY";
  readonly mode: CreativeMode;
  readonly objectiveRead: string;
  readonly recommendedDirection: CreativeDirection & { readonly whyThisWins: string };
  readonly alternatives: readonly CreativeDirection[];
  readonly creativeChallenge: string;
  readonly questions: readonly DevelopmentQuestion[];
  readonly sequencePlan: readonly SequenceIdea[];
  readonly directorBlueprint: DirectorBlueprint;
  readonly productionNextSteps: readonly string[];
}

interface Candidate extends CreativeDirection {
  readonly score: number;
}

interface Context {
  readonly concept: string;
  readonly project: string;
  readonly goal: string;
  readonly goalReference: string;
  readonly audience: string;
  readonly emotion: string;
  readonly constraints: string;
}

function clean(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}

function quote(value: string): string {
  return `“${clean(value)}”`;
}

function detectMode(brief: CreativeBrief): CreativeMode {
  const explicit = clean(brief.projectType).toLowerCase();
  const combined =
    `${explicit} ${brief.title} ${brief.creativeGoal} ${brief.context}`.toLowerCase();
  const modeSignals: ReadonlyArray<readonly [CreativeMode, RegExp]> = [
    ["PERFORMANCE", /performance|music|concert|dance|song|artist|stage|live session/],
    [
      "DOCUMENTARY",
      /documentary|interview|profile|portrait|testimonial|real[- ]life|founder story/,
    ],
    ["COMMERCIAL", /commercial|campaign|brand|product|advert|spot|promo|launch|social|reel/],
    ["NARRATIVE", /narrative|short film|feature|scripted|fiction|drama|comedy/],
  ];
  for (const [mode, signal] of modeSignals) {
    if (signal.test(explicit)) return mode;
  }
  for (const [mode, signal] of modeSignals) {
    if (signal.test(combined)) return mode;
  }
  if (/family|community|legacy|craft|portrait|interview|documentary|real person/.test(combined)) {
    return "DOCUMENTARY";
  }
  if (/product|restaurant|food|campaign|customer|brand|launch/.test(combined)) {
    return "COMMERCIAL";
  }
  return "OPEN";
}

function candidate(
  score: number,
  unconventional: boolean,
  title: string,
  thesis: string,
  organizingPrinciple: string,
  audienceEffect: string,
  execution: string,
  tradeoff: string,
): Candidate {
  return {
    score,
    unconventional,
    title,
    thesis,
    organizingPrinciple,
    audienceEffect,
    execution,
    tradeoff,
  };
}

function modeCandidates(mode: CreativeMode, c: Context): Candidate[] {
  switch (mode) {
    case "DOCUMENTARY":
      return [
        candidate(
          100,
          false,
          "Build around the irreversible handoff",
          `Do not make ${c.project} a complete biography. Find the moment when knowledge, responsibility, identity, or belonging changes hands and cannot simply return to its earlier state.`,
          "One consequential transfer organizes past, present, and possible future.",
          `The audience understands ${c.project} through a human change they can feel, not a chronology they must memorize.`,
          "Open on the work already in motion; reveal the history only when it changes the meaning of the handoff.",
          "This direction sacrifices breadth. If no real transfer exists, reject it rather than manufacture one.",
        ),
        candidate(
          88,
          false,
          "Work before words",
          `Let observable behavior carry ${c.project} before anyone explains it.`,
          "Repeated action accumulates meaning; interviews answer questions raised by behavior.",
          "Viewers form their own curiosity before receiving interpretation.",
          "Build the opening from hands, routine, interruptions, and decisions; delay the formal sit-down.",
          "Requires patient access and strong observational sound; weak behavior cannot be rescued by exposition.",
        ),
        candidate(
          84,
          false,
          "Contradiction-led portrait",
          "Find the gap between what the central person says and what their choices reveal.",
          "Each sequence tests one stated belief against behavior or consequence.",
          "The audience participates in judging the character instead of receiving a tribute film.",
          "Pair assertions with concrete scenes that complicate them; let the contradiction remain unresolved long enough to matter.",
          "Can feel prosecutorial unless the contradiction is contextualized and counter-evidence is retained.",
        ),
        candidate(
          82,
          true,
          "Let one object become the witness",
          `Organize ${c.project} around one recurring object, place, or gesture rather than conventional interview chronology.`,
          "The recurring element changes meaning each time it returns.",
          "The audience experiences memory and change through visual association instead of explanation.",
          "Introduce the motif without explanation, revisit it at each turn, and let the final return carry the conclusion.",
          "The device must emerge from the real project. A decorative symbol would make the film feel imposed.",
        ),
      ];
    case "COMMERCIAL":
      return [
        candidate(
          100,
          false,
          "Proof before promise",
          `Do not begin ${c.project} with a claim. Let the audience experience the product, service, or outcome working before the brand explains itself.`,
          "A visible proof beat earns every later message.",
          `The audience moves from skepticism to desire through evidence, serving ${c.goalReference}.`,
          "Open on the consequence or sensory payoff, trace back to the decisive process, then land the brand only after proof.",
          "The product must have a demonstrable effect; polish without proof will expose the weakness faster.",
        ),
        candidate(
          89,
          false,
          "Make the process the drama",
          "Treat every act of making, choosing, or using as a sequence of consequential decisions rather than coverage.",
          "Each craft step raises anticipation and removes one barrier to the payoff.",
          "Specific process detail makes quality credible and desire tactile.",
          "Use macro detail, cause-and-effect cutting, and sound-led transitions; reveal the final result only after the process earns it.",
          "Process becomes empty fetish if the audience never understands why a choice changes the result.",
        ),
        candidate(
          85,
          false,
          "Center the customer's cost",
          `Frame ${c.project} around the friction, time, risk, or compromise removed for the audience.`,
          "Before/after is organized by lived consequence rather than feature list.",
          "The audience recognizes its own problem before encountering the offer.",
          "Stage one precise moment of friction, show the intervention, then hold long enough for the changed behavior to register.",
          "A vague or exaggerated problem will feel manipulative; use only a defensible customer truth.",
        ),
        candidate(
          83,
          true,
          "Withhold the hero",
          `Keep the expected hero image in ${c.project} off-screen until the audience has built a sensory picture of it.`,
          "Sound, reaction, shadow, aftermath, or negative space creates the first half; the reveal becomes structural.",
          "Curiosity turns a familiar product reveal into an earned event.",
          "Design the opening around consequences and reactions, then spend the hero image once, at maximum value.",
          "Withholding cannot become confusion; identity cues and duration must fit the platform constraint.",
        ),
      ];
    case "PERFORMANCE":
      return [
        candidate(
          100,
          false,
          "Let the constraint shape the performance",
          `Give ${c.project} one visible spatial, temporal, or sonic rule and let the performer push against it.`,
          "Escalation comes from changing the relationship to a single constraint, not adding coverage.",
          `The audience feels growing pressure and release instead of watching a technically competent montage.`,
          "Establish the rule in one readable master, move progressively closer as it strains, then break the visual grammar once.",
          "The rule must support the performance; an arbitrary gimmick will compete with it.",
        ),
        candidate(
          88,
          false,
          "Body, room, audience",
          `Treat ${c.project} as a changing triangle between performer, space, and witness.`,
          "Each section privileges a different relationship: isolation, contact, then shared energy.",
          "Viewers feel physically located inside the performance rather than outside a coverage edit.",
          "Assign camera distance and sound perspective to each phase; save direct audience acknowledgment for the turn.",
          "Needs coherent geography and controlled eyelines; random roaming will collapse the progression.",
        ),
        candidate(
          84,
          false,
          "Ritual before spectacle",
          `Begin ${c.project} with preparation, breath, touch, or tuning so spectacle grows from human concentration.`,
          "Private ritual becomes the emotional threshold into public performance.",
          "The audience invests in effort before receiving virtuosity.",
          "Use close sound and restrained frames for preparation, then widen only when performance changes the room.",
          "The ritual must be authentic to the performer, not staged as generic backstage texture.",
        ),
        candidate(
          82,
          true,
          "Spend one section in near-darkness",
          `Remove most visual information from one meaningful passage of ${c.project} and let sound, silhouette, or touch carry it.`,
          "Absence resets attention and makes the returning image consequential.",
          "The audience listens actively, then experiences the visual return as a release.",
          "Choose the passage for emotional reason, previsualize exposure and safety, and let the sonic perspective lead the transition.",
          "Merely underexposing footage is not a concept; the removed information must change audience attention.",
        ),
      ];
    case "NARRATIVE":
      return [
        candidate(
          100,
          false,
          "Enter after the safe choice",
          `Begin ${c.project} once the protagonist has already crossed the line that prevents an easy return.`,
          "The story reveals motive through consequence instead of front-loading explanation.",
          "The audience leans forward to reconstruct the choice while immediately feeling its cost.",
          "Open on the first irreversible consequence, seed only the minimum prior context, and make each scene force a new choice.",
          "Withholding motive can become vagueness; every unanswered question must produce active tension.",
        ),
        candidate(
          88,
          false,
          "Give each scene a physical objective",
          `Make every scene in ${c.project} turn on something a character must do in the space, not information they need to state.`,
          "Blocking and task carry subtext; dialogue becomes pressure rather than explanation.",
          "The audience reads power shifts before characters name them.",
          "Define a visible objective, obstruction, and changed position for each sequence; cut when the power geometry changes.",
          "Physical business must be causally tied to the scene or it becomes decorative busyness.",
        ),
        candidate(
          84,
          false,
          "Withhold the expected reaction",
          `After the major event in ${c.project}, stay with the person least expected to carry its emotional consequence.`,
          "Reaction and aftermath become narrative evidence rather than punctuation.",
          "The audience discovers a secondary stake that complicates the obvious reading.",
          "Plant the alternate witness early, then hold their response without explanatory dialogue.",
          "The viewpoint shift must deepen the central conflict, not advertise cleverness.",
        ),
        candidate(
          82,
          true,
          "Invert the point of view",
          `Test ${c.project} from the perspective of the person, place, or system normally treated as background.`,
          "Foreground and background exchange narrative weight while the core event stays recognizable.",
          "The audience confronts an assumption built into the conventional version.",
          "Rewrite one sequence with the original protagonist at the frame edge; compare what becomes newly visible and what is lost.",
          "Use the inversion only if it reveals consequence; novelty without meaning is rejected.",
        ),
      ];
    case "OPEN":
      return [
        candidate(
          100,
          false,
          "Center the consequence, not the premise",
          `Do not spend ${c.project} explaining what the idea is. Organize it around the human choice or consequence that proves why it matters.`,
          "A visible change gives the idea a beginning, pressure, and destination without forcing a generic three-act template.",
          `The audience understands the premise by feeling what it changes.`,
          "Name the decisive before/after, enter at the first pressure point, and remove context that does not alter the choice.",
          "If no consequence can be named, the idea needs development before production detail.",
        ),
        candidate(
          88,
          false,
          "One action, examined deeply",
          `Reduce ${c.project} to the action that contains the most meaning and observe how its details change.`,
          "Variation inside one action replaces a list of loosely connected ideas.",
          "Specificity creates curiosity and gives the audience something concrete to track.",
          "Repeat the action in three contexts; change distance, duration, and sound only when its meaning changes.",
          "The action must genuinely contain the project; otherwise reduction will make it feel smaller, not sharper.",
        ),
        candidate(
          84,
          false,
          "Build from a disputed assumption",
          `Identify what ${c.project} currently assumes the audience will accept, then construct the film as a test of that belief.`,
          "Claim, complication, and revised understanding organize the work.",
          "The audience receives a point of view that can earn trust by surviving challenge.",
          "State the assumption visually, introduce the strongest counterexample, and let the ending reflect what remains true.",
          "A straw-man objection creates fake rigor; the counter-position must be genuinely credible.",
        ),
        candidate(
          82,
          true,
          "Make the missing element the structure",
          `Instead of hiding what ${c.project} lacks, organize the piece around the search for that absent person, image, answer, or proof.`,
          "Absence becomes forward motion; each sequence changes what the audience thinks is missing.",
          "The audience participates in discovery rather than receiving a finished explanation.",
          "Name the absence early, collect attempts rather than filler, and permit the ending to remain unresolved if that is truthful.",
          "Do not manufacture mystery. The absence must be real and meaningful to the project.",
        ),
      ];
  }
}

function crossDisciplinaryCandidates(c: Context): Candidate[] {
  return [
    candidate(
      76,
      true,
      "Compose it like a piece of music",
      `Give ${c.project} a recurring phrase, interruption, silence, and return rather than relying on explanatory sections.`,
      "Rhythm and recurrence carry development; visual ideas return altered, like musical motifs.",
      "The audience feels pattern and change before consciously naming structure.",
      "Define one image and one sound motif, vary each twice, then remove both before the final return.",
      "Formal rhythm must clarify meaning. Repetition without development becomes style without story.",
    ),
    candidate(
      74,
      true,
      "Use negative space as evidence",
      `Let what is withheld, off-screen, or left quiet in ${c.project} become an active part of the audience's reading.`,
      "Each omission creates a question that a later image either answers or deliberately complicates.",
      "The audience becomes attentive to implication instead of being told what to feel.",
      "Choose one expected image or explanation to omit; build clear surrounding evidence so the absence is legible, not vague.",
      "Withholding without sufficient context feels unfinished. The missing information must have a precise function.",
    ),
  ];
}

function distinctCandidates(candidates: readonly Candidate[]): Candidate[] {
  const seen = new Set<string>();
  return candidates.filter((item) => {
    const key = `${item.title.toLowerCase()}|${item.organizingPrinciple.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function selectDirections(mode: CreativeMode, c: Context) {
  const ranked = distinctCandidates([...modeCandidates(mode, c), ...crossDisciplinaryCandidates(c)])
    .filter(
      (item) =>
        item.thesis.length > 30 &&
        item.audienceEffect.length > 30 &&
        item.execution.length > 30 &&
        item.tradeoff.length > 20,
    )
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));
  const recommended = ranked[0]!;
  const conventional = ranked.filter((item) => item !== recommended && !item.unconventional);
  const unconventional = ranked.find((item) => item !== recommended && item.unconventional);
  const alternatives = [...conventional.slice(0, 2), ...(unconventional ? [unconventional] : [])];
  return { recommended, alternatives };
}

function publicDirection(item: Candidate): CreativeDirection {
  return {
    title: item.title,
    thesis: item.thesis,
    organizingPrinciple: item.organizingPrinciple,
    audienceEffect: item.audienceEffect,
    execution: item.execution,
    tradeoff: item.tradeoff,
    unconventional: item.unconventional,
  };
}

function questionsFor(brief: CreativeBrief, mode: CreativeMode): DevelopmentQuestion[] {
  const questions: DevelopmentQuestion[] = [];
  if (!clean(brief.creativeGoal)) {
    questions.push({
      prompt:
        "What should be different for the audience after the film ends—not what should they know, but what should they feel, question, or do?",
      decisionItChanges: "Defines the story objective and what material is expendable.",
    });
  }
  if (!clean(brief.targetAudience)) {
    questions.push({
      prompt:
        "Who has the most to gain or lose from this idea, and what do they already believe about it?",
      decisionItChanges: "Changes the entry point, assumed context, and degree of explanation.",
    });
  }
  if (!clean(brief.desiredEmotion)) {
    questions.push({
      prompt:
        "Which final feeling would make the film successful—and which adjacent feeling would cheapen it?",
      decisionItChanges:
        "Sets the emotional target, performance direction, sound, and ending restraint.",
    });
  }
  if (!clean(brief.projectType)) {
    questions.push({
      prompt:
        "What form gives this idea its strongest advantage: observed reality, performance, scripted scene, or persuasive proof?",
      decisionItChanges:
        "Determines the production method instead of forcing the idea into a default format.",
    });
  }
  if (!clean(brief.context)) {
    questions.push({
      prompt:
        "What is genuinely available—people, access, location, time, archive, product, performance—and what cannot be staged or promised?",
      decisionItChanges: "Separates an executable direction from a speculative treatment.",
    });
  }
  const modeQuestion: Record<CreativeMode, DevelopmentQuestion> = {
    DOCUMENTARY: {
      prompt:
        "What changed hands, changed meaning, or became impossible to undo—and who would dispute that reading?",
      decisionItChanges:
        "Tests the proposed transformation and identifies counter-evidence before shooting.",
    },
    COMMERCIAL: {
      prompt:
        "What observable proof would make the promise credible with the logo and copy removed?",
      decisionItChanges: "Determines the hero action and prevents feature-list advertising.",
    },
    PERFORMANCE: {
      prompt: "Where does the performer lose control, recover it, or deliberately refuse polish?",
      decisionItChanges:
        "Locates the performance turn and the camera/sound grammar that should change with it.",
    },
    NARRATIVE: {
      prompt:
        "What is the first choice that costs the protagonist something they cannot fully recover?",
      decisionItChanges: "Sets the true beginning and removes explanatory setup.",
    },
    OPEN: {
      prompt:
        "What human choice or consequence proves this is a film rather than an explanation of an idea?",
      decisionItChanges: "Determines whether to advance, reframe, or reject the current premise.",
    },
  };
  questions.push(modeQuestion[mode]);
  return questions.slice(0, 6);
}

function sequencePlan(mode: CreativeMode, c: Context): SequenceIdea[] {
  const firstPicture: Record<CreativeMode, string> = {
    DOCUMENTARY:
      "Begin on a specific routine already underway; hands and consequence before biography.",
    COMMERCIAL:
      "Begin on the audience-visible result or sensory consequence; no introductory claim.",
    PERFORMANCE: "Establish performer, room, and governing constraint in one readable frame.",
    NARRATIVE: "Enter on the first consequence after the safe choice is gone.",
    OPEN: "Open on the concrete action or consequence that makes the premise matter.",
  };
  const firstSound: Record<CreativeMode, string> = {
    DOCUMENTARY:
      "Lead with close production sound from the real routine plus clean room tone; withhold score until the human stakes are legible.",
    COMMERCIAL:
      "Make the proof tactile with the real action sound at close perspective; reserve music for momentum after credibility is earned.",
    PERFORMANCE:
      "Establish the full live sound perspective and room response before isolating a voice, instrument, breath, or footfall.",
    NARRATIVE:
      "Anchor the opening in one character's sound perspective; use off-screen activity to imply the consequence without explanatory dialogue.",
    OPEN: "Record the central action cleanly and let its natural rhythm establish the world before adding a musical interpretation.",
  };
  const turnPicture: Record<CreativeMode, string> = {
    DOCUMENTARY:
      "Hold the real geography across the decisive action and both affected people; change distance only after the handoff or contradiction occurs.",
    COMMERCIAL:
      "Trace cause to effect in readable screen direction: process detail, intervention, then the audience-visible result in the same sequence.",
    PERFORMANCE:
      "Move from the readable master into one closer physical detail only when the performer begins to strain against the established constraint.",
    NARRATIVE:
      "Recompose the objective and obstruction as their power changes; preserve eyelines and let the losing character inherit less frame space.",
    OPEN: "Test the premise by introducing one real obstruction or absence; keep action and consequence visible in the same geography.",
  };
  const turnSound: Record<CreativeMode, string> = {
    DOCUMENTARY:
      "Protect the complete answer and the sound of the action beneath it; let contradiction or interruption create the turn without editorial music pressure.",
    COMMERCIAL:
      "Build rhythm from process detail, then remove one layer at the proof beat so the result is heard rather than announced by copy.",
    PERFORMANCE:
      "Shift from room perspective toward the performer at the strain point; preserve dynamics and let the musical event—not an edit effect—mark the turn.",
    NARRATIVE:
      "Narrow into the character's subjective perspective as the cost lands; use silence or an off-screen cue that changes the next choice.",
    OPEN: "Let one interruption, failure, or withheld sound test the current reading; avoid a generic rise that predetermines the answer.",
  };
  const returnPicture: Record<CreativeMode, string> = {
    DOCUMENTARY:
      "Revisit the opening routine with the changed participant, object, or responsibility now visible; hold long enough to admit counter-evidence.",
    COMMERCIAL:
      "Return to the opening result with the cause now understood and the product or service legible once, without adding an unrelated hero montage.",
    PERFORMANCE:
      "Return to the original master after the rule is broken; make the altered body, room, or audience relationship visible in one sustained frame.",
    NARRATIVE:
      "Echo the opening geometry after the consequence, reversing or emptying one position so the power change reads before dialogue.",
    OPEN: "Repeat the central action with one verified difference; if nothing meaningful changes, end on the unresolved absence rather than fake closure.",
  };
  const returnSound: Record<CreativeMode, string> = {
    DOCUMENTARY:
      "Bring back the opening room or tool motif in its real environment; leave the final image uninterpreted if the evidence remains mixed.",
    COMMERCIAL:
      "Resolve the sensory motif at the payoff and give brand or call-to-action audio its own clean beat only after the proof lands.",
    PERFORMANCE:
      "Restore the full room perspective and audience response; avoid flattening the release with over-compression or a pasted-on sting.",
    NARRATIVE:
      "Return the opening sound cue altered in distance, ownership, or absence; stop before dialogue explains the visual consequence.",
    OPEN: "Return or withhold the opening sound motif according to what the test revealed; let ambiguity remain when it is truthful.",
  };
  return [
    {
      title: "01 · Evidence of the world",
      purpose: `Make ${c.project} legible without explaining everything.`,
      picture: firstPicture[mode],
      sound: firstSound[mode],
    },
    {
      title: "02 · Pressure changes the meaning",
      purpose: `Introduce the choice, obstruction, contradiction, or test that makes ${c.goalReference} consequential.`,
      picture: turnPicture[mode],
      sound: turnSound[mode],
    },
    {
      title: "03 · Return with a difference",
      purpose: `Revisit the opening image or action so the audience can feel ${c.emotion || "a changed emotional state"} through changed context.`,
      picture: returnPicture[mode],
      sound: returnSound[mode],
    },
  ];
}

function directorBlueprint(
  mode: CreativeMode,
  c: Context,
  direction: Candidate,
): DirectorBlueprint {
  type CraftPlan = Pick<
    DirectorBlueprint,
    | "composition"
    | "blocking"
    | "camera"
    | "practicalsAndLighting"
    | "backgroundAndDesign"
    | "colorAndGrade"
    | "movement"
    | "soundAndAtmosphere"
    | "mustGet"
    | "optionalExploration"
  >;
  const craftPlans: Record<CreativeMode, CraftPlan> = {
    DOCUMENTARY: {
      composition:
        "Hold the decisive work in the foreground and the person affected by it in a separate depth plane; the frame should preserve both action and response without forcing a reaction insert.",
      blocking:
        "Follow the real routine and let the participants choose their own distance. Preserve the handoff in one geography; do not direct an observed action to repeat unless the staging is disclosed and accepted.",
      camera:
        "Use an eye-level 40–65mm-equivalent observational frame for the routine, then earn one tighter perspective after the irreversible action. Keep a clean master running through the handoff rather than collecting lens-variety coverage.",
      practicalsAndLighting:
        "Preserve the location's truthful window and practical direction. Augment one existing source, add restrained negative fill, and protect mixed-color texture instead of relighting the space into a generic interview look.",
      backgroundAndDesign:
        "Retain verified tools, wear, family traces, or work-in-progress that reveal the real environment. Remove only accidental clutter and protected information; do not plant symbolic props as documentary evidence.",
      colorAndGrade:
        "Keep skin and practical color credible, with modest contrast and highlight roll-off that preserves the room. If time periods or responsibilities differ, separate them through exposure or warmth only when the source supports that distinction.",
      movement:
        "Stay locked or use quiet shoulder movement while the routine is stable. Reposition in response to a real transfer or contradiction, never in anticipation of a beat the subjects have not created.",
      soundAndAtmosphere:
        "Isolate the decisive action, both voices, and a full room bed. Protect pauses and overlapping reality; introduce music only after the human relationship is clear, and retain contradictory words or sounds rather than smoothing them away.",
      mustGet: [
        "An uninterrupted geography frame showing who performs the work, who receives it, and what can change hands.",
        "The real handoff or refusal with synchronous production sound and enough lead-in and aftermath to judge its meaning.",
        "Independent reactions from both sides plus any observable counter-evidence that complicates the preferred interpretation.",
      ],
      optionalExploration:
        "Test the recurring-object direction with one verified tool, recipe, place, or gesture; keep it only if its meaning changes through real events rather than editorial symbolism.",
    },
    COMMERCIAL: {
      composition:
        "Place the demonstrable action in tactile foreground and its audience-visible consequence in a second readable plane; reserve clean negative space for one earned brand beat, not default copy coverage.",
      blocking:
        "Stage one continuous cause-and-effect path: user encounters friction, product or service intervenes, behavior changes. Keep hands, product, and result in consistent screen direction so the proof cannot be mistaken for montage implication.",
      camera:
        "Pair one 85–105mm-equivalent detail perspective for material texture with one 35–50mm proof frame that contains action and result. Lock the proof shot; spend any push, slider move, or hero angle only on the verified change.",
      practicalsAndLighting:
        "Build a broad motivated key for people, then add a controlled edge or glancing source that reveals the product's real shape and texture. Protect labels, food, screens, and reflective highlights from false color or unreadable glare.",
      backgroundAndDesign:
        "Use the actual use environment and only props that clarify the customer problem or process. Echo an approved brand color once; remove decorative lifestyle objects that imply an unsupported audience or product claim.",
      colorAndGrade:
        "Prioritize product and skin color accuracy, clean separation, and platform-safe contrast. Let the result become slightly richer only through a defensible lighting or exposure change, not an artificial before/after grade deception.",
      movement:
        "Keep the friction and proof frames stable enough to audit. Use one precise motivated move to connect intervention to result; reject orbiting, speed ramps, and gimbal drift that obscure how the benefit occurs.",
      soundAndAtmosphere:
        "Capture the hero action, material texture, and user response separately. Build the transition from real cause-and-effect sound; leave copy and music out of the proof beat until the visual claim is understandable on its own.",
      mustGet: [
        "A single readable proof shot in which the intervention and its result can be understood without copy.",
        "Clean tactile details of the actual process or product, including any limitation the final claim must not conceal.",
        "A held user consequence or changed behavior, followed by one legally and visually clean brand or call-to-action frame.",
      ],
      optionalExploration:
        "Test withholding the conventional hero image while sound and consequence establish desire; reveal it only if recognition stays clear and the delayed image becomes more valuable.",
    },
    PERFORMANCE: {
      composition:
        "Begin with a full-body master that makes performer, room, and governing spatial or sonic constraint readable; hold a second plane for the boundary the performer will approach or break.",
      blocking:
        "Map the performer's authentic path, breath points, instrument reach, and audience relationship before adding camera marks. Preserve one boundary or axis long enough that crossing it registers as progression rather than coverage variation.",
      camera:
        "Protect an uninterrupted 28–35mm-equivalent master, then assign a 50–85mm detail frame to the physical strain or release. Save the closest distance and any axis break for the exact performance turn.",
      practicalsAndLighting:
        "Motivate from verified stage, window, or room fixtures and pre-cue one exposure-safe change at the musical or physical turn. Keep faces, hands, and instruments readable; darkness must be designed, monitored, and emotionally justified.",
      backgroundAndDesign:
        "Show enough floor, audience, instruments, cables, architecture, or rehearsal evidence to locate the performance. Remove visual conflicts but do not sterilize the working room or invent backstage ritual.",
      colorAndGrade:
        "Preserve skin and highlight detail under practical or stage color, with a stable baseline before the turn. If palette changes, tie the shift to a performance section and maintain continuity across the master and detail cameras.",
      movement:
        "Give each section one camera grammar: stable geography, then motivated approach, then a single release or rupture. Do not chase every gesture; performer motion should lead and camera motion should answer.",
      soundAndAtmosphere:
        "Record the complete performance, isolated primary sources where available, and a time-aligned room or audience pair. Protect dynamics, breath, count-ins, and the transition into silence; never substitute montage sound for the governing performance take.",
      mustGet: [
        "An uninterrupted master containing the complete performance arc and the established constraint.",
        "The physical or musical turn in a usable closer perspective without losing sync or the decisive action.",
        "The room or audience response and a clean post-performance hold before anyone breaks the emotional release.",
      ],
      optionalExploration:
        "Previsualize one meaningful passage in silhouette or near-darkness and let sound carry it; retain the removal only if the returning image changes attention rather than merely looking dramatic.",
    },
    NARRATIVE: {
      composition:
        "Frame the active objective and obstruction in the same geography, assigning each character a readable zone and depth. The power relationship should remain legible with dialogue muted.",
      blocking:
        "Give each character a physical objective, boundary, and changed end position. Let crossings, withheld movement, and eyelines express the scene turn; remove business that does not alter choice or power.",
      camera:
        "Establish geography on a restrained 35–50mm-equivalent perspective, then choose the scene's owner before assigning closer lenses. Change height, focal length, or axis only when point of view or power changes—not for coverage insurance.",
      practicalsAndLighting:
        "Motivate key direction from a story-world window or practical and design one controllable falloff zone for the obstruction. Cue any contrast or color shift to the consequential choice while preserving continuity for the full scene action.",
      backgroundAndDesign:
        "Place only props, wardrobe, texture, and background behavior that reveal objective, history, or pressure. Give the decisive object a consistent home and prevent extras or set dressing from stealing the scene turn.",
      colorAndGrade:
        "Define a restrained baseline palette for the character's safe state, then alter density, separation, or temperature after the costly choice. Preserve skin and matching latitude so the change can be shaped without discontinuity.",
      movement:
        "Lock the camera while a character believes they control the scene; begin one motivated track, pan, or handheld shift when that control fails. End in a new geometry instead of returning automatically to coverage positions.",
      soundAndAtmosphere:
        "Capture dialogue perspective, the decisive prop or action, room tone, and the off-screen cue that changes the choice. Use silence subjectively after the cost lands; score must not tell the audience what blocking and performance have not earned.",
      mustGet: [
        "A master that contains the objective, obstruction, spatial boundary, and changed end position in one playable take.",
        "The consequential action and the other character's receiving reaction with matching eyelines and clean production sound.",
        "Only the insert or atmosphere detail that causally changes the scene; no generic cutaway list as a substitute for performance coverage.",
      ],
      optionalExploration:
        "Shoot one inversion from the normally background character, place, or system; keep it only if it reveals a consequence the primary coverage cannot express.",
    },
    OPEN: {
      composition:
        "Let one concrete action dominate the foreground and reserve a second plane for its consequence or missing element; the premise should become readable through behavior rather than labels.",
      blocking:
        "Stage or observe one testable action with a clear start, obstruction, and result. Keep the subject and consequence in the same geography until the project proves which form—observed, performed, scripted, or persuasive—fits best.",
      camera:
        "Begin the scene test at eye level on one normal lens and record the full action before adding a second distance. Change lens or height only to answer a defined question about point of view, scale, or consequence.",
      practicalsAndLighting:
        "Use the strongest verified practical or daylight direction and shape only enough contrast to keep action and consequence readable. Avoid committing to a stylized lighting grammar before format, access, and emotion are known.",
      backgroundAndDesign:
        "Limit the test to real objects required by the action and one potential motif whose meaning remains explicitly unproven. Remove décor that prematurely locks genre, period, audience, or brand assumptions.",
      colorAndGrade:
        "Keep a neutral, flexible baseline with accurate skin and controlled highlights. Record any proposed palette shift as a test tied to the audience objective, not as an assumed final look.",
      movement:
        "Use a locked baseline take to judge the idea, then test one motivated move at the obstruction or result. Compare meaning and clarity before adopting movement as the project's grammar.",
      soundAndAtmosphere:
        "Capture the central action close, the full environment, and one useful silence. Test music only after the unscored sequence reveals what emotion or ambiguity the project actually needs.",
      mustGet: [
        "A complete baseline take that makes the action, obstruction, and result understandable without format-specific tricks.",
        "One alternate point of view designed to answer a named creative question, not to create generic coverage.",
        "Clean action detail, environment, and aftermath sound so the filmmaker can judge whether the premise holds without music.",
      ],
      optionalExploration:
        "Remove the expected explanation, subject, or image from one pass and test whether the real absence creates meaning; restore it immediately if the result is only vague.",
    },
  };
  const craftPlan = craftPlans[mode];
  return {
    sequenceTitle: direction.title,
    scenePurpose: direction.audienceEffect,
    emotionalTarget: c.emotion
      ? `Move from observation toward ${c.emotion} without announcing the feeling.`
      : "Move from observation to investment; the precise final emotion remains an open creative decision.",
    ...craftPlan,
    risk: `${direction.tradeoff} Known constraints: ${c.constraints}`,
    rendering: {
      capability: "STRUCTURED_BLUEPRINT_ONLY",
      provider: null,
      aestheticContract: "HAND_DRAWN_DIRECTOR_NOTEBOOK",
      limitation:
        "No visual storyboard provider is configured. This is a shootable structured blueprint, not a claim that frames were rendered.",
    },
  };
}

export function generateDevelopmentBlueprint(brief: CreativeBrief): DevelopmentBlueprint {
  const mode = detectMode(brief);
  const statedGoal = clean(brief.creativeGoal);
  const context: Context = {
    concept: quote(brief.title),
    project: "the film",
    goal: statedGoal || "define the change the audience should feel, question, or act on",
    goalReference: statedGoal
      ? `the stated goal (${quote(statedGoal)})`
      : "the unresolved audience objective",
    audience: clean(brief.targetAudience) || "an audience that still needs to be defined",
    emotion: clean(brief.desiredEmotion).toLowerCase(),
    constraints:
      clean(brief.context) ||
      "none supplied; access, duration, format, and resources remain unverified",
  };
  const { recommended, alternatives } = selectDirections(mode, context);
  const objectiveRead = statedGoal
    ? `The stated job is to ${context.goal}. For ${context.audience}, success is not coverage of ${context.concept}; it is a specific change in attention, feeling, or action that the film can earn.`
    : `${context.concept} is a premise, not yet a finished objective. The first creative decision is to identify the human consequence that makes it worth watching; all directions below are hypotheses until the filmmaker supplies or verifies that consequence.`;

  return {
    basis: "PROJECT_INTENT_ONLY",
    mode,
    objectiveRead,
    recommendedDirection: {
      ...publicDirection(recommended),
      whyThisWins: `It turns ${context.concept} into a specific organizing decision, an audience effect, and a production test while leaving unknown facts visibly unresolved. It addresses ${context.goalReference} without pretending that proposed scenes or evidence already exist.`,
    },
    alternatives: alternatives.map(publicDirection),
    creativeChallenge:
      mode === "DOCUMENTARY"
        ? "If the film cannot name a real change and its counter-evidence, it has a subject but not yet a story. Do not compensate with biography or inspirational music."
        : mode === "COMMERCIAL"
          ? "If the promise cannot be shown without copy, the concept is still an assertion. Strengthen the proof before increasing polish."
          : mode === "PERFORMANCE"
            ? "Coverage is not progression. Define what changes in the performer, room, or audience before adding cameras or movement."
            : mode === "NARRATIVE"
              ? "If a scene changes no choice, power relationship, or consequence, it is setup the film cannot afford."
              : "If the project cannot name a human choice or consequence, resist production detail and sharpen the premise first.",
    questions: questionsFor(brief, mode),
    sequencePlan: sequencePlan(mode, context),
    directorBlueprint: directorBlueprint(mode, context, recommended),
    productionNextSteps: [
      "Answer the two questions that would most change the recommended direction; revise the direction before making a shot list.",
      `Run one low-cost scene test for “${recommended.title}” and judge whether the intended audience effect is visible without explanation.`,
      "Capture the must-get action and sound cleanly before optional coverage; protect source integrity and record what was staged versus observed.",
      `Compare the recommended direction against “${alternatives.find((item) => item.unconventional)?.title ?? alternatives[0]?.title}”; keep the less familiar option only if it improves meaning and execution.`,
    ],
  };
}
