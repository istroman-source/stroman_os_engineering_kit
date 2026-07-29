import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { SourceStorage } from "@/domain/source-import";

interface StoredObjectState {
  readonly leases: Set<string>;
  ownedByProcess: boolean;
  retained: boolean;
}

export class FileSystemSourceStorage implements SourceStorage {
  private readonly objects = new Map<string, StoredObjectState>();
  private readonly locks = new Map<string, Promise<void>>();

  constructor(private readonly root: string) {}

  async put(key: string, bytes: Uint8Array): Promise<{ readonly leaseId: string }> {
    return this.exclusive(key, async () => {
      const target = this.target(key);
      await mkdir(dirname(target), { recursive: true });
      let state = this.objects.get(key);
      if (!state) {
        state = { leases: new Set(), ownedByProcess: false, retained: false };
        this.objects.set(key, state);
      }
      try {
        await writeFile(target, bytes, { flag: "wx" });
        state.ownedByProcess = true;
      } catch (error) {
        if (!isAlreadyExists(error)) throw error;
        const existing = await readFile(target);
        if (!existing.equals(bytes)) throw new Error("Stored source failed its integrity check");
        // An object from a prior process may already be committed. Never infer
        // exclusive ownership or delete it from this process.
        if (!state.ownedByProcess && state.leases.size === 0) state.retained = true;
      }
      const leaseId = randomUUID();
      state.leases.add(leaseId);
      return { leaseId };
    });
  }

  async retain(key: string, leaseId: string): Promise<void> {
    await this.exclusive(key, async () => {
      const state = this.requireLease(key, leaseId);
      state.retained = true;
      state.leases.delete(leaseId);
    });
  }

  async discard(key: string, leaseId: string): Promise<void> {
    await this.exclusive(key, async () => {
      const state = this.requireLease(key, leaseId);
      state.leases.delete(leaseId);
      if (state.ownedByProcess && !state.retained && state.leases.size === 0) {
        await rm(this.target(key), { force: true });
        this.objects.delete(key);
      }
    });
  }

  private requireLease(key: string, leaseId: string): StoredObjectState {
    const state = this.objects.get(key);
    if (!state?.leases.has(leaseId)) throw new Error("Unknown source storage lease");
    return state;
  }

  private async exclusive<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const prior = this.locks.get(key) ?? Promise.resolve();
    let release!: () => void;
    const next = new Promise<void>((resolveLock) => {
      release = resolveLock;
    });
    const tail = prior.then(() => next);
    this.locks.set(key, tail);
    await prior;
    try {
      return await operation();
    } finally {
      release();
      if (this.locks.get(key) === tail) this.locks.delete(key);
    }
  }

  private target(key: string): string {
    const target = resolve(this.root, key);
    const root = resolve(this.root);
    if (target !== root && !target.startsWith(`${root}/`)) throw new Error("Invalid storage key");
    return target;
  }
}

function isAlreadyExists(error: unknown): boolean {
  return (
    error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "EEXIST"
  );
}
