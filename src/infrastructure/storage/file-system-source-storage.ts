import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { SourceStorage } from "@/domain/source-import";

export class FileSystemSourceStorage implements SourceStorage {
  constructor(private readonly root: string) {}

  async put(key: string, bytes: Uint8Array): Promise<void> {
    const target = this.target(key);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }

  async remove(key: string): Promise<void> {
    await rm(this.target(key), { force: true });
  }

  private target(key: string): string {
    const target = resolve(this.root, key);
    const root = resolve(this.root);
    if (target !== root && !target.startsWith(`${root}/`)) throw new Error("Invalid storage key");
    return target;
  }
}
