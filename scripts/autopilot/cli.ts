#!/usr/bin/env node
import { resolve } from "node:path";
import { loadConfig } from "./config";
import { ProcessCommandRunner } from "./command-runner";
import { StateStore, withLock } from "./state-store";
import { prepareReview, startWorkflow } from "./workflow";
import { verify } from "./verification";
import { AutopilotError } from "./errors";
import {
  advanceImplemented,
  applyReviewResult,
  mergeReady,
  reviewResultFromFile,
} from "./lifecycle";
const root = resolve(import.meta.dirname, "../.."),
  args = process.argv.slice(2),
  command = args[0]?.startsWith("-") ? "start" : (args[0] ?? "start"),
  runner = new ProcessCommandRunner();
const valueAfter = (flag: string) => {
  const i = args.indexOf(flag);
  return i < 0 ? undefined : args[i + 1];
};
async function main() {
  const c = await loadConfig(root),
    store = new StateStore(root);
  if (command === "status") {
    console.log(JSON.stringify(await store.load(), null, 2));
    return;
  }
  if (command === "abort") {
    const s = await store.load();
    if (s) {
      s.phase = "ABORTED";
      s.completedAt = new Date().toISOString();
      await store.save(s);
    }
    await store.release();
    console.log("Autopilot aborted; user work was not changed.");
    return;
  }
  if (command === "verify") {
    const s = await store.load(),
      out = await verify(root, c, runner, s?.runId ?? `verify-${Date.now()}`);
    console.log(JSON.stringify(out, null, 2));
    process.exitCode = out.every((v) => v.status === "PASSED") ? 0 : 1;
    return;
  }
  if (command === "review") {
    await withLock(store, async () => {
      const state = await store.load();
      const resultPath = valueAfter("--result");
      if (state && resultPath) {
        console.log(
          JSON.stringify(
            await applyReviewResult(
              root,
              c,
              runner,
              state,
              await reviewResultFromFile(resolve(resultPath)),
            ),
            null,
            2,
          ),
        );
      } else console.log(JSON.stringify(await prepareReview(root, c, runner), null, 2));
    });
    return;
  }
  if (command === "resume") {
    await withLock(store, async () => {
      const s = await store.load();
      if (!s) throw new AutopilotError("No interrupted run exists", "NO_RUN");
      if (s.phase === "AWAITING_IMPLEMENTATION")
        console.log(JSON.stringify(await advanceImplemented(root, c, runner, s), null, 2));
      else if (s.phase === "READY_TO_MERGE")
        console.log(JSON.stringify(await mergeReady(root, c, runner, s), null, 2));
      else {
        console.log(JSON.stringify(s, null, 2));
        console.log("Resume requires the recorded actionable state to be satisfied.");
      }
    });
    return;
  }
  if (command === "merge") {
    await withLock(store, async () => {
      const state = await store.load();
      if (!state) throw new AutopilotError("No run is ready to merge", "NO_RUN");
      console.log(JSON.stringify(await mergeReady(root, c, runner, state), null, 2));
    });
    return;
  }
  if (command !== "start")
    throw new AutopilotError(`Unknown command ${command}`, "UNKNOWN_COMMAND");
  const s = await startWorkflow(root, c, runner, {
    milestone: valueAfter("--milestone"),
    continuous: args.includes("--continuous"),
    dryRun: args.includes("--dry-run"),
  });
  console.log(JSON.stringify(s, null, 2));
  if (s.phase === "AWAITING_IMPLEMENTATION")
    console.log(`Implementation prompt: .autopilot/runs/${s.runId}/implementation-prompt.txt`);
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
