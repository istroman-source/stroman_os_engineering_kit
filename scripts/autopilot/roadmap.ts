import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Config, Milestone } from "./types";
import { ApprovalRequiredError, AutopilotError } from "./errors";
const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
async function files(root: string, dir: string): Promise<string[]> {
  const entries = await readdir(resolve(root, dir), { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory()
          ? files(root, join(dir, e.name))
          : Promise.resolve(/^\d{3}_.+\.md$/.test(e.name) ? [join(dir, e.name)] : []),
      ),
    )
  ).flat();
}
export async function listMilestones(root: string, config: Config) {
  const paths = (await Promise.all(config.promptDirectories.map((d) => files(root, d)))).flat();
  const values = await Promise.all(
    paths.map(async (source) => {
      const first = (await readFile(resolve(root, source), "utf8")).split("\n")[0] ?? "";
      const m = first.match(/^# Prompt (\d{3}) — (.+)$/);
      return m ? { id: m[1]!, title: m[2]!, slug: `${m[1]}-${slugify(m[2]!)}`, source } : null;
    }),
  );
  return values.filter((v): v is Milestone => v !== null).sort((a, b) => a.id.localeCompare(b.id));
}
export async function completedMilestones(root: string, config: Config) {
  const progress = await readFile(resolve(root, config.progressFile), "utf8");
  const done = new Set([...progress.matchAll(/^## Prompt (\d{3})/gm)].map((m) => m[1]!));
  const roadmap = await readFile(resolve(root, config.roadmapFile), "utf8");
  const range = roadmap.match(/Prompts? (\d{3})[–-](\d{3}) are complete/);
  if (range)
    for (let n = Number(range[1]); n <= Number(range[2]); n++) done.add(String(n).padStart(3, "0"));
  return done;
}
export async function selectMilestone(root: string, config: Config, override?: string) {
  const [milestones, done] = await Promise.all([
    listMilestones(root, config),
    completedMilestones(root, config),
  ]);
  const roadmap = await readFile(resolve(root, config.roadmapFile), "utf8");
  const declaredNext = roadmap.match(/next incomplete dependency is Prompt (\d{3})/i)?.[1];
  const next = declaredNext
    ? milestones.find((milestone) => milestone.id === declaredNext)
    : milestones.find((milestone) => !done.has(milestone.id));
  if (!next) throw new AutopilotError("No incomplete roadmap milestone found", "ROADMAP_COMPLETE");
  if (!override) return next;
  const chosen = milestones.find((m) => m.id === override.padStart(3, "0"));
  if (!chosen) throw new AutopilotError(`Unknown milestone ${override}`, "MILESTONE_UNKNOWN");
  const skipped = milestones.filter((m) => m.id < chosen.id && !done.has(m.id));
  if (skipped.length)
    throw new ApprovalRequiredError(
      `Milestone ${chosen.id} would skip prerequisites: ${skipped.map((m) => m.id).join(", ")}`,
    );
  return chosen;
}
export const branchFor = (template: string, m: Milestone) => template.replace("{slug}", m.slug);
