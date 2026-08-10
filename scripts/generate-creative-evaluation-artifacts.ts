import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CreativeBriefId,
  createCreativeBrief,
  evaluateCreativeQuality,
  generateBlueprint,
  type CreativeBriefFields,
} from "../src/domain/creative/index";
import { ProjectId } from "../src/domain/project/index";

const root = process.cwd();
const fixture = JSON.parse(
  readFileSync(resolve(root, "evaluations/fixtures/jimmys-famous-meals.json"), "utf8"),
) as { readonly fixtureId: string; readonly brief: CreativeBriefFields };
const created = createCreativeBrief({
  id: CreativeBriefId.unsafe("brief_ARTIFACT1"),
  projectId: ProjectId.unsafe("proj_ARTIFACT1"),
  now: new Date("2026-08-10T00:00:00.000Z"),
  ...fixture.brief,
});
if (!created.ok) throw created.error;
const blueprint = generateBlueprint(created.value);
const quality = evaluateCreativeQuality(created.value, blueprint.development);
if (!quality.passed) {
  throw new Error(`Jimmy fixture failed: ${quality.blockingFindings.join("; ")}`);
}
writeFileSync(
  resolve(root, "evaluations/artifacts/jimmys-creative-output.json"),
  `${JSON.stringify(
    {
      fixtureId: fixture.fixtureId,
      purpose:
        "Exact deterministic fallback output used for semantic and independent product review.",
      quality,
      blueprint,
    },
    null,
    2,
  )}\n`,
);
