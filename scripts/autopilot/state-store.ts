import { mkdir, open, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { RunState } from "./types";
import { AutopilotError } from "./errors";
export class StateStore {
  readonly statePath: string;
  readonly lockPath: string;
  constructor(private readonly root: string) {
    this.statePath = resolve(root, ".autopilot/state/current.json");
    this.lockPath = resolve(root, ".autopilot/run.lock");
  }
  async acquire() {
    await mkdir(dirname(this.lockPath), { recursive: true });
    try {
      const handle = await open(this.lockPath, "wx");
      await handle.writeFile(`${process.pid}\n`);
      await handle.close();
    } catch {
      throw new AutopilotError("Another Autopilot run is active", "LOCKED");
    }
  }
  async release() {
    await rm(this.lockPath, { force: true });
  }
  async load(): Promise<RunState | null> {
    try {
      return JSON.parse(await readFile(this.statePath, "utf8")) as RunState;
    } catch {
      return null;
    }
  }
  async save(state: RunState) {
    await mkdir(dirname(this.statePath), { recursive: true });
    const temp = `${this.statePath}.tmp`;
    await writeFile(
      temp,
      `${JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2)}\n`,
      { mode: 0o600 },
    );
    await rename(temp, this.statePath);
  }
  async clear() {
    await rm(this.statePath, { force: true });
  }
}
