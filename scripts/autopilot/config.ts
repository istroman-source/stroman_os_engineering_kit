import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import type { Config } from "./types";
const schema = z.object({
  version: z.literal(1),
  roadmapFile: z.string(),
  progressFile: z.string(),
  releaseNotesFile: z.string(),
  promptDirectories: z.array(z.string()).min(1),
  verificationCommands: z.array(z.array(z.string()).min(1)).min(1),
  implementationAgentCommand: z.array(z.string()).min(1).nullable(),
  reviewAgentCommand: z.array(z.string()).min(1).nullable(),
  ciTimeoutSeconds: z.number().int().positive(),
  remediationLoopLimit: z.number().int().nonnegative(),
  autoMerge: z.boolean(),
  continuous: z.boolean(),
  branchTemplate: z.string().includes("{slug}"),
  protectedPaths: z.array(z.string()),
  approvalPolicies: z.array(z.string()),
});
export async function loadConfig(root: string): Promise<Config> {
  return schema.parse(
    JSON.parse(await readFile(resolve(root, "autopilot.config.json"), "utf8")),
  ) as Config;
}
