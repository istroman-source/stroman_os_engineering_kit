import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CreativeBriefId,
  createCreativeBrief,
  emptyCreativePlanningContext,
  evaluateVisualPlanQuality,
  generateBlueprint,
  generateDevelopmentBlueprint,
  isScoutKitchenCalibration,
  withPlanningSettings,
  withScoutPhotos,
  withSpatialCorrection,
  type CreativeBriefFields,
  type MeaningfulDevelopment,
  type ScoutPhotoRef,
} from "../src/domain/creative";
import { ProjectId } from "../src/domain/project";

const root = process.cwd();
const briefFixture = JSON.parse(
  readFileSync(resolve(root, "evaluations/fixtures/jimmys-famous-meals.json"), "utf8"),
) as { readonly brief: CreativeBriefFields };
const scoutFixture = JSON.parse(
  readFileSync(resolve(root, "evaluations/fixtures/jimmys-scout-kitchen.json"), "utf8"),
) as {
  readonly photos: readonly ScoutPhotoRef[];
  readonly expectedVisibleFacts: readonly string[];
  readonly expectedUncertainty: string;
  readonly calibrationCorrection: string;
};
const hostedJimmyFixture = JSON.parse(
  readFileSync(resolve(root, "evaluations/artifacts/hosted/jimmys-famous-meals.json"), "utf8"),
) as {
  readonly providerOutput: MeaningfulDevelopment;
};

function project(context = emptyCreativePlanningContext()) {
  const created = createCreativeBrief({
    id: CreativeBriefId.unsafe("brief_VISUAL01"),
    projectId: ProjectId.unsafe("proj_VISUAL01"),
    now: new Date("2026-08-10T00:00:00.000Z"),
    ...briefFixture.brief,
  });
  if (!created.ok) throw created.error;
  return { ...created.value, planningContext: context };
}

function plan(context = emptyCreativePlanningContext()) {
  const brief = project(context);
  return generateBlueprint(brief, generateDevelopmentBlueprint(brief), context).development
    .visualPlan;
}

describe("frame-accurate visual planning release gate", () => {
  it("renders four independently composed horizontal and vertical shot pairs with concise execution strips", () => {
    const output = plan();
    expect(output.shots).toHaveLength(4);
    for (const shot of output.shots) {
      expect(shot.horizontal.aspectRatio).toBe("16:9");
      expect(shot.vertical.aspectRatio).toBe("9:16");
      expect(shot.horizontal.id).not.toBe(shot.vertical.id);
      expect({
        lens: shot.horizontal.lens,
        distance: shot.horizontal.cameraDistance,
        figures: shot.horizontal.figures,
        set: shot.horizontal.setPieces,
      }).not.toEqual({
        lens: shot.vertical.lens,
        distance: shot.vertical.cameraDistance,
        figures: shot.vertical.figures,
        set: shot.vertical.setPieces,
      });
      expect(shot.horizontal.executionStrip.every((line) => line.length <= 150)).toBe(true);
      expect(shot.vertical.executionStrip.every((line) => line.length <= 150)).toBe(true);
    }
    expect(evaluateVisualPlanQuality(output)).toEqual({ passed: true, findings: [] });
  });

  it("uses direct people/camera semantics and keeps blocking, lighting, and look to one question each", () => {
    const output = plan();
    expect(output.blocking.question).toMatch(/people and cameras/i);
    expect(output.blocking.subjects[0]).toMatchObject({
      label: "MOM",
      carries: expect.stringMatching(/baby/i),
    });
    expect(output.blocking.subjects[0]?.states.map((state) => state.label)).toEqual([
      "START",
      "2",
      "END",
    ]);
    expect(output.blocking.cameras.map((camera) => camera.label)).toEqual(["C1", "C2"]);
    expect(output.lighting.question).toMatch(/sources, modifiers, and practicals/i);
    expect(output.look.question).toMatch(/palette, contrast, texture/i);
    expect(JSON.stringify(output.blocking)).not.toContain('"kind":"LIGHT"');
  });

  it("grounds the plan in both scout angles while keeping unseen geometry uncertain", () => {
    let context = withScoutPhotos(emptyCreativePlanningContext(), scoutFixture.photos);
    context = withPlanningSettings(context, "PRE_PRODUCTION", {
      crew: "solo operator",
      support: "tripod only",
    });
    expect(isScoutKitchenCalibration(context.scoutPhotos)).toBe(true);
    const output = plan(context);
    expect(output.location.mode).toBe("PHOTO_ANCHORED");
    expect(output.location.photos).toHaveLength(2);
    expect(
      output.location.claims
        .filter((claim) => claim.state === "VISIBLE_FACT")
        .map((claim) => claim.label),
    ).toEqual(expect.arrayContaining([...scoutFixture.expectedVisibleFacts]));
    expect(output.location.claims).toContainEqual(
      expect.objectContaining({
        state: "INFERRED_GEOMETRY",
        label: scoutFixture.expectedUncertainty,
      }),
    );
    expect(output.location.confirmationQuestion).toMatch(/camera space|clearance/i);
    expect(output.shots[0]?.horizontal.locationDependencies).toEqual(
      expect.arrayContaining(["fridge-left", "island-center", "sink-window", "warm-pendant"]),
    );
    expect(output.shots.every((shot) => shot.horizontal.movement.includes("locked"))).toBe(true);
    expect(output.lighting.sources.map((source) => source.label).join(" ")).toMatch(
      /window.*pendant.*fridge/i,
    );
    expect(output.delta.changed.join(" ")).toMatch(/actual sink window|real threshold/i);
    expect(evaluateVisualPlanQuality(output)).toEqual({ passed: true, findings: [] });
  });

  it("grounds the actual hosted storyboard in scout facts without replacing its scene logic", () => {
    const intentBrief = project();
    const intentOutput = generateBlueprint(intentBrief, {
      ...generateDevelopmentBlueprint(intentBrief),
      ...hostedJimmyFixture.providerOutput,
    }).development.visualPlan;
    expect(new Set(intentOutput.lighting.sources.map((source) => source.use)).size).toBeGreaterThan(
      1,
    );

    const context = withPlanningSettings(
      withScoutPhotos(emptyCreativePlanningContext(), scoutFixture.photos),
      "PRE_PRODUCTION",
      { crew: "solo operator", support: "tripod only" },
    );
    const brief = project(context);
    const output = generateBlueprint(
      brief,
      { ...generateDevelopmentBlueprint(brief), ...hostedJimmyFixture.providerOutput },
      context,
    ).development.visualPlan;

    expect(output.location.mode).toBe("PHOTO_ANCHORED");
    expect(output.location.claims.map((claim) => claim.label)).toEqual(
      expect.arrayContaining([...scoutFixture.expectedVisibleFacts]),
    );
    expect(output.shots[0]?.title).toBe("Counter Before Coffee");
    expect(output.shots[0]?.horizontal.setPieces).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "ISLAND", label: "ISLAND" }),
        expect.objectContaining({ kind: "WINDOW", label: "SINK WINDOW" }),
        expect.objectContaining({ kind: "FRIDGE", label: "FRIDGE" }),
      ]),
    );
    expect(output.shots[0]?.vertical.cameraDistance).toMatch(/portrait.*island end/i);
    expect(output.blocking).toMatchObject({
      title: "Photo-anchored hosted blocking",
      subjects: expect.arrayContaining([expect.objectContaining({ label: "MOM" })]),
    });
    expect(output.blocking.zones.map((zone) => zone.label)).toEqual(
      expect.arrayContaining(["ISLAND", "SINK + WINDOW", "FRIDGE"]),
    );
    expect(output.lighting.sources.map((source) => source.label).join(" ")).toMatch(
      /window.*pendant.*fridge/i,
    );
    expect(output.delta.unchanged.join(" ")).toMatch(/hosted creative thesis/i);
    expect(evaluateVisualPlanQuality(output)).toEqual({ passed: true, findings: [] });
  });

  it("accepts arbitrary scout input without inventing pixel-level location facts", () => {
    const context = withScoutPhotos(emptyCreativePlanningContext(), [
      {
        id: "scout_unreviewed",
        mediaAssetId: "mast_UNREVIEWED1",
        fileName: "phone-wide.png",
        contentType: "image/png",
        contentHash: "sha256:not-the-calibration-fixture",
        angleLabel: "Angle 1",
      },
    ]);
    const output = plan(context);
    expect(output.location.mode).toBe("PHOTO_INPUT_PENDING");
    expect(output.location.claims).toEqual([
      expect.objectContaining({
        state: "VISIBLE_FACT",
        label: "Scout image set received",
        detail: expect.stringMatching(/not interpreted physical layout/i),
      }),
    ]);
    expect(output.location.claims).not.toContainEqual(
      expect.objectContaining({ state: "INFERRED_GEOMETRY" }),
    );
    expect(output.delta.unchanged.join(" ")).toMatch(/no camera lane.*was inferred/i);
    expect(evaluateVisualPlanQuality(output)).toEqual({ passed: true, findings: [] });
  });

  it("regenerates affected spatial plans after a concise filmmaker correction", () => {
    const grounded = withScoutPhotos(emptyCreativePlanningContext(), scoutFixture.photos);
    const corrected = withSpatialCorrection(grounded, {
      id: "corr_fixture",
      statement: scoutFixture.calibrationCorrection,
      replacesClaimId: "inferred_camera_lane",
    });
    const output = plan(corrected);
    expect(output.location.claims).toContainEqual(
      expect.objectContaining({
        state: "FILMMAKER_CONFIRMED_GEOMETRY",
        detail: scoutFixture.calibrationCorrection,
      }),
    );
    expect(output.location.claims).not.toContainEqual(
      expect.objectContaining({ id: "inferred_camera_lane" }),
    );
    expect(output.blocking.cameras.find((camera) => camera.id === "c2")?.use).toMatch(/rejected/i);
    expect(output.lighting.sources.find((source) => source.id === "pendant")).toMatchObject({
      control: "CONFIRMED",
      use: expect.stringMatching(/fixed-output/i),
    });
    expect(output.delta.trigger).toBe("Filmmaker correction applied");
    expect(output.delta.changed).toContain(scoutFixture.calibrationCorrection);
    expect(output.location.confirmationQuestion).toMatch(/remaining clearance, power, or safety/i);
    expect(evaluateVisualPlanQuality(output)).toEqual({ passed: true, findings: [] });
  });

  it("keeps checked-in JSON evidence synchronized with the deterministic generators", () => {
    const intentBrief = project();
    const expectedIntent = generateBlueprint(
      intentBrief,
      generateDevelopmentBlueprint(intentBrief),
    );
    const actualIntent = JSON.parse(
      readFileSync(resolve(root, "evaluations/artifacts/jimmys-creative-output.json"), "utf8"),
    ) as { readonly blueprint: unknown };
    expect(actualIntent.blueprint).toEqual(expectedIntent);

    const scoutContext = withPlanningSettings(
      withScoutPhotos(emptyCreativePlanningContext(), scoutFixture.photos),
      "PRE_PRODUCTION",
      { crew: "solo operator", support: "tripod only", shootTime: "four setups" },
    );
    const scoutBrief = project(scoutContext);
    const expectedScout = generateBlueprint(
      scoutBrief,
      generateDevelopmentBlueprint(scoutBrief),
      scoutContext,
    );
    const actualScout = JSON.parse(
      readFileSync(
        resolve(root, "evaluations/artifacts/jimmys-scout-creative-output.json"),
        "utf8",
      ),
    ) as { readonly blueprint: unknown };
    expect(actualScout.blueprint).toEqual(expectedScout);
  });

  it("prioritizes must-get coverage and explicitly permits restraint", () => {
    const output = plan();
    expect(output.coverage.filter((setup) => setup.priority === "MUST_GET")).toHaveLength(2);
    expect(output.coverage.find((setup) => setup.priority === "OPTIONAL_EXPLORATION")?.why).toMatch(
      /skip/i,
    );
    expect(output.sound.find((beat) => beat.sceneId === "scene_stillness")?.restraint).toMatch(
      /music enters only/i,
    );
  });

  it("rejects repeated anonymous diagrams and translates hosted storyboard intent into distinct frames", () => {
    const created = createCreativeBrief({
      id: CreativeBriefId.unsafe("brief_HOSTVIS1"),
      projectId: ProjectId.unsafe("proj_HOSTVIS1"),
      now: new Date("2026-08-11T00:00:00.000Z"),
      title: "Third Shift at Harbor Light",
      client: "Baltimore Working Waterfront Archive",
      projectType: "observational documentary profile",
      creativeGoal: "Make overnight dock judgment legible without staging danger.",
      targetAudience: "Baltimore residents who encounter the harbor in daylight",
      desiredEmotion: "alert respect",
      context: "One dispatcher, one crane spotter, live radio, one overnight shift.",
    });
    if (!created.ok) throw created.error;
    const fallback = generateDevelopmentBlueprint(created.value);
    const anonymous = generateBlueprint(created.value, fallback).development.visualPlan;
    expect(evaluateVisualPlanQuality(anonymous)).toMatchObject({
      passed: false,
      findings: expect.arrayContaining([
        expect.stringMatching(/anonymous placeholder/i),
        expect.stringMatching(/generic composition template/i),
      ]),
    });

    const labels = [
      ["SPOTTER\uFFFC AT LOCKER", 'RADIO】【，"KIND":"OBJECT"}', "LOCKER EDGE"],
      ["SPOTTER ON MARK", "BERTH MARK", "RAIL LINE"],
      ["DISPATCHER LISTENING", "RADIO", "BREAK-ROOM TABLE"],
      ["SPOTTER HELD STEP", "BOOT AT LINE", "REFLECTIVE TAPE"],
    ] as const;
    const hosted = {
      ...fallback,
      reasoningSource: "HOSTED_REASONING" as const,
      storyboard: {
        ...fallback.storyboard,
        frames: fallback.storyboard.frames.map((frame, index) => ({
          ...frame,
          glyphs: [
            {
              kind: "ADULT" as const,
              x: 25 + index * 13,
              y: 35 + (index % 2) * 8,
              scale: 0.85,
              label: labels[index]![0],
            },
            {
              kind: "OBJECT" as const,
              x: 62 - index * 7,
              y: 58,
              scale: 0.65,
              label: labels[index]![1],
            },
            {
              kind: index % 2 === 0 ? ("TABLE" as const) : ("DOOR" as const),
              x: 78,
              y: 48 - index * 6,
              scale: 0.8,
              label: labels[index]![2],
            },
          ],
          arrows: [
            {
              fromX: 28 + index * 4,
              fromY: 56,
              toX: 60,
              toY: 44 + index * 3,
              label:
                index === fallback.storyboard.frames.length - 1
                  ? "stops before line"
                  : "call changes action",
            },
          ],
        })),
        blocking: {
          ...fallback.storyboard.blocking,
          title: "Spotter mark and dispatcher listening position",
          positions: [
            { label: "SPOTTER START", x: 26, y: 66, kind: "SUBJECT" as const },
            { label: "SPOTTER HELD MARK", x: 64, y: 48, kind: "SUBJECT" as const },
            { label: "C1 SAFE BERTH LANE", x: 13, y: 72, kind: "CAMERA" as const },
            { label: "WORK LIGHT", x: 84, y: 15, kind: "LIGHT" as const },
          ],
        },
      },
    };
    const translated = generateBlueprint(created.value, hosted).development.visualPlan;
    expect(translated.shots[0]?.horizontal.figures.map((item) => item.label)).toContain(
      "SPOTTER AT LOCKER",
    );
    expect(translated.shots[0]?.horizontal.setPieces.map((item) => item.label)).toContain("RADIO");
    expect(translated.shots[1]?.vertical.setPieces.map((item) => item.label)).toContain(
      "BERTH MARK",
    );
    expect(translated.shots.at(-1)?.horizontal.motion[0]?.label).toBe("stops before line");
    expect(translated.blocking.subjects[0]?.label).toMatch(/spotter/i);
    expect(evaluateVisualPlanQuality(translated)).toEqual({ passed: true, findings: [] });

    const familyHosted = {
      ...hosted,
      sceneHypotheses: hosted.sceneHypotheses.map((scene, index) =>
        index === 0
          ? {
              ...scene,
              action:
                "Cousin A and Cousin B carry the chair while Cousin C steps in to intercept it.",
            }
          : scene,
      ),
      storyboard: {
        ...hosted.storyboard,
        frames: hosted.storyboard.frames.map((frame, index) =>
          index === 0
            ? {
                ...frame,
                glyphs: frame.glyphs.map((glyph, glyphIndex) =>
                  glyphIndex === 0 ? { ...glyph, label: "COUSIN A\uFFFC" } : glyph,
                ),
              }
            : frame,
        ),
      },
    };
    const familyPlan = generateBlueprint(created.value, familyHosted).development.visualPlan;
    expect(familyPlan.shots[0]?.horizontal.figures.map((item) => item.label)).toEqual(
      expect.arrayContaining(["COUSIN A", "COUSIN B", "COUSIN C"]),
    );
    expect(evaluateVisualPlanQuality(familyPlan)).toEqual({ passed: true, findings: [] });

    const groupedBlocking = generateBlueprint(created.value, {
      ...hosted,
      storyboard: {
        ...hosted.storyboard,
        blocking: {
          ...hosted.storyboard.blocking,
          positions: [
            { label: "MOM START", x: 20, y: 60, kind: "SUBJECT" as const },
            { label: "MOM CHOICE", x: 42, y: 42, kind: "SUBJECT" as const },
            { label: "MOM FLOOR", x: 68, y: 66, kind: "SUBJECT" as const },
            { label: "RADIO START", x: 52, y: 48, kind: "SUBJECT" as const },
            { label: "CAMERA 1", x: 10, y: 82, kind: "CAMERA" as const },
          ],
          paths: [],
        },
      },
    }).development.visualPlan.blocking;
    expect(groupedBlocking.subjects).toHaveLength(2);
    expect(
      groupedBlocking.subjects.find((subject) => subject.label === "MOM")?.states,
    ).toHaveLength(3);
    expect(groupedBlocking.subjects.find((subject) => subject.label === "RADIO")?.marker).toBe(
      "OBJECT",
    );
  });
});
