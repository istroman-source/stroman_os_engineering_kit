import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../scripts/autopilot/config";
import { listMilestones, selectMilestone } from "../../scripts/autopilot/roadmap";

describe("bundled foundation roadmap sequencing", () => {
  const root = resolve(process.cwd());

  it("preserves canonical prompt titles and selects the first genuinely incomplete prompt", async () => {
    const config = await loadConfig(root);
    const milestones = await listMilestones(root, config);

    expect(milestones.find(({ id }) => id === "004")?.title).toBe("Monorepo and folder structure");
    await expect(selectMilestone(root, config)).resolves.toMatchObject({
      id: "016",
      title: "Audit and integration domain model",
    });
  });
});
