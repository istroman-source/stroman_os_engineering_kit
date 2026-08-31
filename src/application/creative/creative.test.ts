import { describe, expect, it } from "vitest";
import { NotAuthorizedError, NotFoundError } from "../shared/errors";
import { createProject, makeProjectName, OwnerId, ProjectId } from "@/domain/project";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import {
  InMemoryDecisionRepository,
  InMemoryProjectRepository,
} from "../../../test/adapters/in-memory-repositories";
import { InMemoryCreativeBriefRepository } from "../../../test/adapters/in-memory-creative-brief-repository";
import { getCreativeBrief } from "./get-creative-brief";
import { listCreativeBriefRevisions } from "./list-creative-brief-revisions";
import { saveCreativeBrief } from "./save-creative-brief";
import { updateCreativePlanning } from "./update-creative-planning";
import { FakeCreativeReasoningProvider } from "../../../test/adapters/fake-creative-reasoning-provider";
import { InvalidValueError } from "@/domain/shared";
import {
  attachCreativeBlueprint,
  CreativeBriefId,
  createCreativeBrief,
  generateBlueprint,
  generateDevelopmentBlueprint,
  instructionAtDeskShotPlanning,
} from "@/domain/creative";
import { createDecision, DecisionId } from "@/domain/decision";

const OWNER = OwnerId.unsafe("usr_OWNER001");
const OTHER = OwnerId.unsafe("usr_OTHER001");
const PROJECT = ProjectId.unsafe("proj_AAAAAAA1");

function fields() {
  return {
    title: "Morning routine of an everyday mom who eats Jimmy's Famous Meals",
    client: "Jimmy's Famous Meals",
    projectType: "Commercial",
    creativeGoal: "Conversion",
    targetAudience: "Parents who need convenience",
    desiredEmotion: "Understood, relatable, sentimental",
    context:
      "An everyday mother and her eight-month-old baby. Do not show the baby's face. Hands and feet are allowed.",
    runtimeTarget: "30 seconds",
    deliveryPlatform: "Broadcast and social",
    references: "Natural morning-routine observation",
    restrictions: "Never show the baby's face.",
    clientRequirements: "Show Jimmy's Famous Meals clearly.",
    nonNegotiables: "Hands and feet only when the baby enters frame.",
    successCriteria: "Parents recognize a credible convenience benefit.",
  };
}

function deps() {
  const projects = new InMemoryProjectRepository();
  const name = makeProjectName("Reel");
  if (!name.ok) throw name.error;
  projects.insert(
    createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: new Date("2026-07-19") }),
  );
  return {
    projects,
    creativeBriefs: new InMemoryCreativeBriefRepository(),
    decisions: new InMemoryDecisionRepository(),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(new Date("2026-07-19T00:00:00.000Z")),
    creativeReasoning: new FakeCreativeReasoningProvider(),
  };
}

describe("saveCreativeBrief", () => {
  it("creates a brief and returns a blueprint on first analysis", async () => {
    const d = deps();
    const result = await saveCreativeBrief(d, {
      actorId: OWNER,
      projectId: PROJECT,
      fields: fields(),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.brief.title).toContain("Jimmy's Famous Meals");
    expect(result.value.brief.runtimeTarget).toBe("30 seconds");
    expect(result.value.brief.restrictions).toContain("baby's face");
    expect(result.value.blueprint.hookConcepts).toHaveLength(3);
    const persisted = await d.creativeBriefs.findByProject(PROJECT);
    expect(persisted?.blueprint).toEqual(result.value.blueprint);
    expect(persisted?.reasoningProvider).toBe("deterministic-specialist-v2");
  });

  it("updates the brief on re-analysis (same project)", async () => {
    const d = deps();
    await saveCreativeBrief(d, { actorId: OWNER, projectId: PROJECT, fields: fields() });
    const directionDecision = createDecision({
      id: DecisionId.unsafe("dec_DIRECTION01"),
      projectId: PROJECT,
      question: "Use this direction?",
      options: [
        { id: "keep", label: "Keep" },
        { id: "reject", label: "Reject" },
      ],
      context: {
        originStage: "DEVELOP",
        artifactKind: "CREATIVE_DIRECTION",
        artifactVersion: 1,
      },
      now: d.clock.now(),
    });
    if (!directionDecision.ok) throw directionDecision.error;
    d.decisions.seed(directionDecision.value);
    const again = await saveCreativeBrief(d, {
      actorId: OWNER,
      projectId: PROJECT,
      fields: { ...fields(), desiredEmotion: "nostalgic" },
    });
    expect(again.ok).toBe(true);
    if (!again.ok) return;
    expect(again.value.brief.desiredEmotion).toBe("nostalgic");
    // Still exactly one brief for the project.
    expect(await d.creativeBriefs.findByProject(PROJECT)).not.toBeNull();
    const history = await d.creativeBriefs.listRevisions(PROJECT);
    expect(history).toHaveLength(2);
    expect(history.map((revision) => revision.fields.desiredEmotion)).toEqual([
      "Understood, relatable, sentimental",
      "nostalgic",
    ]);
    expect((await d.decisions.findById(directionDecision.value.id))?.context).toMatchObject({
      needsReview: true,
      reviewReason: expect.stringContaining("intent changed"),
    });
  });

  it("denies analyzing another owner's project", async () => {
    const d = deps();
    const result = await saveCreativeBrief(d, {
      actorId: OTHER,
      projectId: PROJECT,
      fields: fields(),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });

  it("returns NotFound for a missing project", async () => {
    const d = deps();
    const result = await saveCreativeBrief(d, {
      actorId: OWNER,
      projectId: ProjectId.unsafe("proj_MISSING1"),
      fields: fields(),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
  });
});

describe("listCreativeBriefRevisions", () => {
  it("returns immutable intent history to the owner and denies another owner", async () => {
    const d = deps();
    await saveCreativeBrief(d, { actorId: OWNER, projectId: PROJECT, fields: fields() });
    await saveCreativeBrief(d, {
      actorId: OWNER,
      projectId: PROJECT,
      fields: { ...fields(), successCriteria: "Parents choose the product without feeling sold." },
    });

    const history = await listCreativeBriefRevisions(d, { actorId: OWNER, projectId: PROJECT });
    expect(history.ok && history.value.map((revision) => revision.version)).toEqual([1, 2]);
    expect(history.ok && history.value[1]?.successCriteria).toBe(
      "Parents choose the product without feeling sold.",
    );

    const denied = await listCreativeBriefRevisions(d, {
      actorId: OTHER,
      projectId: PROJECT,
    });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toBeInstanceOf(NotAuthorizedError);
  });
});

describe("getCreativeBrief", () => {
  it("returns NotFound before analysis, then the analysis after", async () => {
    const d = deps();
    const before = await getCreativeBrief(d, { actorId: OWNER, projectId: PROJECT });
    expect(before.ok).toBe(false);

    await saveCreativeBrief(d, { actorId: OWNER, projectId: PROJECT, fields: fields() });
    const after = await getCreativeBrief(d, { actorId: OWNER, projectId: PROJECT });
    expect(after.ok).toBe(true);
    if (after.ok) {
      expect(after.value.blueprint.projectSummary).toContain("Jimmy's Famous Meals");
      expect(after.value.blueprint).not.toHaveProperty("masterPrompt");
    }
  });

  it("denies another owner", async () => {
    const d = deps();
    await saveCreativeBrief(d, { actorId: OWNER, projectId: PROJECT, fields: fields() });
    const denied = await getCreativeBrief(d, { actorId: OTHER, projectId: PROJECT });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toBeInstanceOf(NotAuthorizedError);
  });
});

describe("updateCreativePlanning", () => {
  const scoutPhotos = [
    {
      id: "scout_threshold",
      mediaAssetId: "mast_SCOUT001",
      fileName: "threshold.png",
      contentType: "image/png",
      contentHash: "sha256:256f5714e3ada933de706cb5d8d47caad2f3b3899dcd4a438e794078b97de626",
      angleLabel: "Threshold wide",
    },
    {
      id: "scout_reverse",
      mediaAssetId: "mast_SCOUT002",
      fileName: "reverse.png",
      contentType: "image/png",
      contentHash: "sha256:e222ebf5190d36e8962d646dfad2f0d3e0f6b9ca5be78cf0fcdb257630514ddb",
      angleLabel: "Sink-side reverse",
    },
  ] as const;

  it("preserves hosted storyboard scene logic when the filmmaker changes planning stage", async () => {
    const d = deps();
    const created = createCreativeBrief({
      id: CreativeBriefId.unsafe("brief_HOSTPLAN1"),
      projectId: PROJECT,
      now: new Date("2026-07-19T00:00:00.000Z"),
      ...fields(),
    });
    if (!created.ok) throw created.error;
    const hostedDevelopment = {
      ...generateDevelopmentBlueprint(created.value),
      reasoningSource: "HOSTED_REASONING" as const,
    };
    const hostedBlueprint = generateBlueprint(created.value, hostedDevelopment);
    d.creativeBriefs.insert(
      attachCreativeBlueprint(created.value, hostedBlueprint, "openai-responses:gpt-test"),
    );

    const result = await updateCreativePlanning(d, {
      actorId: OWNER,
      projectId: PROJECT,
      stage: "SCOUTING",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blueprint.development.reasoningSource).toBe("HOSTED_REASONING");
    expect(result.value.blueprint.development.visualPlan.stage).toBe("SCOUTING");
    expect(result.value.blueprint.development.visualPlan.delta.trigger).toBe(
      "Hosted creative direction developed",
    );
    expect(result.value.blueprint.development.visualPlan.shots[0]?.title).toBe(
      hostedDevelopment.sceneHypotheses[0]?.title,
    );
  });

  it("updates only the planning layer and persists photo-grounded spatial state", async () => {
    const d = deps();
    await saveCreativeBrief(d, { actorId: OWNER, projectId: PROJECT, fields: fields() });
    const shotDecision = createDecision({
      id: DecisionId.unsafe("dec_SHOTPLAN01"),
      projectId: PROJECT,
      question: "Use this shot?",
      options: [
        { id: "keep", label: "Keep" },
        { id: "revise", label: "Revise" },
      ],
      context: {
        originStage: "BUILD",
        artifactKind: "SHOT_PLAN",
        artifactVersion: 1,
      },
      now: d.clock.now(),
    });
    if (!shotDecision.ok) throw shotDecision.error;
    d.decisions.seed(shotDecision.value);
    const result = await updateCreativePlanning(d, {
      actorId: OWNER,
      projectId: PROJECT,
      stage: "PRE_PRODUCTION",
      production: { crew: "solo operator", support: "tripod only" },
      scoutPhotos,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blueprint.development.visualPlan).toMatchObject({
      stage: "PRE_PRODUCTION",
      location: { mode: "PHOTO_ANCHORED" },
      productionReality: { crew: "solo operator", support: "tripod only" },
    });
    expect(result.value.blueprint.development.directionDecision.title).toBe("The first quiet bite");
    const persisted = await d.creativeBriefs.findByProject(PROJECT);
    expect(persisted?.planningContext.scoutPhotos).toHaveLength(2);
    expect(persisted?.blueprint).toEqual(result.value.blueprint);
    expect((await d.decisions.findById(shotDecision.value.id))?.context).toMatchObject({
      needsReview: true,
      reviewReason: expect.stringContaining("spatial plan changed"),
    });
  });

  it("applies a spatial correction without re-entering project intent", async () => {
    const d = deps();
    await saveCreativeBrief(d, { actorId: OWNER, projectId: PROJECT, fields: fields() });
    await updateCreativePlanning(d, { actorId: OWNER, projectId: PROJECT, scoutPhotos });
    const corrected = await updateCreativePlanning(d, {
      actorId: OWNER,
      projectId: PROJECT,
      correction: {
        statement: "Camera cannot go behind the island; the pendant cannot be dimmed.",
        replacesClaimId: "inferred_camera_lane",
      },
    });
    expect(corrected.ok).toBe(true);
    if (!corrected.ok) return;
    expect(corrected.value.blueprint.development.visualPlan.delta.trigger).toBe(
      "Filmmaker correction applied",
    );
    expect(
      corrected.value.blueprint.development.visualPlan.blocking.cameras.find(
        (camera) => camera.id === "c2",
      )?.use,
    ).toMatch(/rejected/i);
    expect(corrected.value.brief.title).toBe(fields().title);
  });

  it("persists a versioned spatial shot without changing the creative recommendation", async () => {
    const d = deps();
    await saveCreativeBrief(d, { actorId: OWNER, projectId: PROJECT, fields: fields() });
    const shotPlanning = instructionAtDeskShotPlanning();
    const result = await updateCreativePlanning(d, {
      actorId: OWNER,
      projectId: PROJECT,
      shotPlanning,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.brief.planningContext.shotPlanning).toEqual(shotPlanning);
    expect(result.value.blueprint.development.directionDecision.title).toBe("The first quiet bite");
    const persisted = await d.creativeBriefs.findByProject(PROJECT);
    expect(persisted?.planningContext.shotPlanning?.activeShot).toMatchObject({
      title: "Instruction at the Desk",
      camera: { focalLengthMm: 35, aspectRatio: "16:9" },
      geometryConfidence: "ESTIMATED",
    });
  });

  it("denies another owner from changing a plan", async () => {
    const d = deps();
    await saveCreativeBrief(d, { actorId: OWNER, projectId: PROJECT, fields: fields() });
    const result = await updateCreativePlanning(d, {
      actorId: OTHER,
      projectId: PROJECT,
      stage: "SHOOTING",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });

  it("rejects an empty filmmaker correction before changing the plan", async () => {
    const d = deps();
    await saveCreativeBrief(d, { actorId: OWNER, projectId: PROJECT, fields: fields() });
    const result = await updateCreativePlanning(d, {
      actorId: OWNER,
      projectId: PROJECT,
      correction: { statement: "   " },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidValueError);
  });
});
