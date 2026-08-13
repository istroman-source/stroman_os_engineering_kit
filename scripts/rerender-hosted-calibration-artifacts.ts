import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { format } from "prettier";
import {
  CreativeBriefId,
  createCreativeBrief,
  emptyCreativePlanningContext,
  evaluateCreativeQuality,
  evaluateVisualPlanQuality,
  generateBlueprint,
  generateDevelopmentBlueprint,
  withPlanningSettings,
  withScoutPhotos,
  type CreativeBriefFields,
  type MeaningfulDevelopment,
  type ScoutPhotoRef,
} from "../src/domain/creative/index";
import { ProjectId } from "../src/domain/project/index";

interface HostedArtifact {
  readonly case: {
    readonly id: string;
    readonly expectedMode: "COMMERCIAL" | "DOCUMENTARY" | "NARRATIVE" | "PERFORMANCE" | "OPEN";
    readonly brief: CreativeBriefFields;
  };
  readonly providerOutput?: MeaningfulDevelopment;
  readonly [key: string]: unknown;
}

interface ScoutFixture {
  readonly photos: readonly ScoutPhotoRef[];
}

async function formattedJson(value: unknown): Promise<string> {
  return format(JSON.stringify(value), { parser: "json", printWidth: 100, tabWidth: 2 });
}

function createBrief(artifact: HostedArtifact, id: string) {
  const created = createCreativeBrief({
    id: CreativeBriefId.unsafe(`brief_${id}`),
    projectId: ProjectId.unsafe(`proj_${id}`),
    now: new Date("2026-08-11T00:00:00.000Z"),
    ...artifact.case.brief,
  });
  if (!created.ok) throw created.error;
  return created.value;
}

async function main(): Promise<void> {
  const directory = resolve(process.cwd(), "evaluations/artifacts/hosted");
  const files = (await readdir(directory))
    .filter(
      (file) =>
        file.endsWith(".json") &&
        !file.includes("baseline") &&
        !file.includes("failure") &&
        !file.includes("hosted-scout"),
    )
    .sort();
  let translated = 0;
  let jimmyArtifact: HostedArtifact | undefined;
  for (const [index, file] of files.entries()) {
    const path = resolve(directory, file);
    const artifact = JSON.parse(await readFile(path, "utf8")) as HostedArtifact;
    if (!artifact.providerOutput) continue;
    const suffix = String(index + 1).padStart(4, "0");
    const brief = createBrief(artifact, `RERENDER${suffix}`);
    const creativeQuality = evaluateCreativeQuality(brief, artifact.providerOutput);
    if (!creativeQuality.passed) {
      throw new Error(`${artifact.case.id} no longer passes creative quality.`);
    }
    const blueprint = generateBlueprint(
      brief,
      { ...generateDevelopmentBlueprint(brief), ...artifact.providerOutput },
      brief.planningContext,
    );
    if (blueprint.development.mode !== artifact.case.expectedMode) {
      throw new Error(
        `${artifact.case.id} rerendered as ${blueprint.development.mode}, expected ${artifact.case.expectedMode}.`,
      );
    }
    const visualQuality = evaluateVisualPlanQuality(blueprint.development.visualPlan);
    if (!visualQuality.passed) {
      throw new Error(
        `${artifact.case.id} no longer passes visual quality: ${visualQuality.findings.join("; ")}`,
      );
    }
    await writeFile(
      path,
      await formattedJson({
        ...artifact,
        creativeQuality,
        visualQuality,
        translationPath: "generateBlueprint(providerOutput)",
        blueprint,
      }),
      "utf8",
    );
    translated += 1;
    console.log(
      JSON.stringify({ case: artifact.case.id, state: "RERENDERED", file: basename(path) }),
    );
    if (artifact.case.id === "jimmys-famous-meals") jimmyArtifact = artifact;
  }

  if (!jimmyArtifact?.providerOutput) {
    throw new Error("Jimmy's hosted artifact is required for scout-grounding calibration.");
  }
  const scoutFixture = JSON.parse(
    await readFile(
      resolve(process.cwd(), "evaluations/fixtures/jimmys-scout-kitchen.json"),
      "utf8",
    ),
  ) as ScoutFixture;
  const planningContext = withPlanningSettings(
    withScoutPhotos(emptyCreativePlanningContext(), scoutFixture.photos),
    "PRE_PRODUCTION",
    { crew: "solo operator", support: "tripod only", shootTime: "four setups" },
  );
  const scoutBrief = createBrief(jimmyArtifact, "HOSTEDSCOUT");
  const scoutCreativeQuality = evaluateCreativeQuality(scoutBrief, jimmyArtifact.providerOutput);
  const scoutBlueprint = generateBlueprint(
    scoutBrief,
    { ...generateDevelopmentBlueprint(scoutBrief), ...jimmyArtifact.providerOutput },
    planningContext,
  );
  const scoutVisualQuality = evaluateVisualPlanQuality(scoutBlueprint.development.visualPlan);
  if (!scoutCreativeQuality.passed || !scoutVisualQuality.passed) {
    throw new Error(
      `Jimmy's hosted scout calibration failed: ${scoutVisualQuality.findings.join("; ")}`,
    );
  }
  const scoutPath = resolve(directory, "jimmys-famous-meals-hosted-scout.json");
  await writeFile(
    scoutPath,
    await formattedJson({
      ...jimmyArtifact,
      case: { ...jimmyArtifact.case, id: "jimmys-famous-meals-hosted-scout" },
      scenario: "Actual hosted direction grounded in the two-angle kitchen scout fixture.",
      planningContext,
      creativeQuality: scoutCreativeQuality,
      visualQuality: scoutVisualQuality,
      translationPath: "generateBlueprint(providerOutput, scoutContext)",
      blueprint: scoutBlueprint,
    }),
    "utf8",
  );
  translated += 1;
  console.log(
    JSON.stringify({
      case: "jimmys-famous-meals-hosted-scout",
      state: "RERENDERED",
      file: basename(scoutPath),
    }),
  );
  console.log(JSON.stringify({ state: "COMPLETE", translated }));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown rerender failure.";
  console.error(JSON.stringify({ state: "FAILED", error: message }));
  process.exitCode = 1;
});
