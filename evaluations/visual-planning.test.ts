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
});
