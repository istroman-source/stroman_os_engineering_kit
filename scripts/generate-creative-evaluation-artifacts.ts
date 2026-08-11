import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { format } from "prettier";
import {
  CreativeBriefId,
  createCreativeBrief,
  emptyCreativePlanningContext,
  evaluateCreativeQuality,
  evaluateVisualPlanQuality,
  generateBlueprint,
  generateDevelopmentBlueprint,
  type CreativeBriefFields,
  type ScoutPhotoRef,
  withPlanningSettings,
  withScoutPhotos,
} from "../src/domain/creative/index";
import { ProjectId } from "../src/domain/project/index";

async function main() {
  const root = process.cwd();
  const fixture = JSON.parse(
    readFileSync(resolve(root, "evaluations/fixtures/jimmys-famous-meals.json"), "utf8"),
  ) as { readonly fixtureId: string; readonly brief: CreativeBriefFields };
  const scoutFixture = JSON.parse(
    readFileSync(resolve(root, "evaluations/fixtures/jimmys-scout-kitchen.json"), "utf8"),
  ) as { readonly fixtureId: string; readonly photos: readonly ScoutPhotoRef[] };
  const created = createCreativeBrief({
    id: CreativeBriefId.unsafe("brief_ARTIFACT1"),
    projectId: ProjectId.unsafe("proj_ARTIFACT1"),
    now: new Date("2026-08-10T00:00:00.000Z"),
    ...fixture.brief,
  });
  if (!created.ok) throw created.error;
  const development = generateDevelopmentBlueprint(created.value);
  const blueprint = generateBlueprint(created.value, development);
  const quality = evaluateCreativeQuality(created.value, development);
  const visualQuality = evaluateVisualPlanQuality(blueprint.development.visualPlan);
  if (!quality.passed) {
    throw new Error(`Jimmy fixture failed: ${quality.blockingFindings.join("; ")}`);
  }
  if (!visualQuality.passed)
    throw new Error(`Jimmy visual fixture failed: ${visualQuality.findings.join("; ")}`);
  writeFileSync(
    resolve(root, "evaluations/artifacts/jimmys-creative-output.json"),
    await format(
      JSON.stringify(
        {
          fixtureId: fixture.fixtureId,
          purpose:
            "Exact deterministic fallback output used for semantic and independent product review.",
          quality,
          visualQuality,
          blueprint,
        },
        null,
        2,
      ),
      { parser: "json", printWidth: 100, tabWidth: 2 },
    ),
  );
  const scoutContext = withPlanningSettings(
    withScoutPhotos(emptyCreativePlanningContext(), scoutFixture.photos),
    "PRE_PRODUCTION",
    { crew: "solo operator", support: "tripod only", shootTime: "four setups" },
  );
  const scoutBrief = { ...created.value, planningContext: scoutContext };
  const scoutDevelopment = generateDevelopmentBlueprint(scoutBrief);
  const scoutBlueprint = generateBlueprint(scoutBrief, scoutDevelopment, scoutContext);
  const scoutVisualQuality = evaluateVisualPlanQuality(scoutBlueprint.development.visualPlan);
  if (!scoutVisualQuality.passed) {
    throw new Error(`Jimmy scout fixture failed: ${scoutVisualQuality.findings.join("; ")}`);
  }
  writeFileSync(
    resolve(root, "evaluations/artifacts/jimmys-scout-creative-output.json"),
    await format(
      JSON.stringify(
        {
          fixtureId: scoutFixture.fixtureId,
          purpose: "Exact multi-angle location-grounding output for visual and independent review.",
          visualQuality: scoutVisualQuality,
          blueprint: scoutBlueprint,
        },
        null,
        2,
      ),
      { parser: "json", printWidth: 100, tabWidth: 2 },
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
