import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { FileSystemSourceStorage } from "./file-system-source-storage";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function storage() {
  const root = await mkdtemp(join(tmpdir(), "stroman-source-storage-"));
  roots.push(root);
  return { root, storage: new FileSystemSourceStorage(root) };
}

describe("file-system source storage leases", () => {
  it("never lets a failed concurrent attempt delete bytes retained by a successful import", async () => {
    const fixture = await storage();
    const bytes = new Uint8Array([1, 2, 3]);
    const [failedAttempt, successfulAttempt] = await Promise.all([
      fixture.storage.put("owner/project/sha256:test", bytes),
      fixture.storage.put("owner/project/sha256:test", bytes),
    ]);
    await fixture.storage.discard("owner/project/sha256:test", failedAttempt.leaseId);
    await fixture.storage.retain("owner/project/sha256:test", successfulAttempt.leaseId);
    expect(await readFile(join(fixture.root, "owner/project/sha256:test"))).toEqual(
      Buffer.from(bytes),
    );
  });

  it("deletes only an exclusively created object after its final failed lease", async () => {
    const fixture = await storage();
    const lease = await fixture.storage.put("owner/project/sha256:failed", new Uint8Array([9]));
    await fixture.storage.discard("owner/project/sha256:failed", lease.leaseId);
    await expect(readFile(join(fixture.root, "owner/project/sha256:failed"))).rejects.toMatchObject(
      { code: "ENOENT" },
    );
  });
});
