import { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { verifySeedReady } from "../../../prisma/seed";

describe("database seed boundary (real PostgreSQL)", () => {
  it("verifies a fully migrated database without creating product records", async () => {
    const database = new PrismaClient();
    try {
      const before = await Promise.all([
        database.project.count(),
        database.contentItem.count(),
        database.rubric.count(),
      ]);

      await expect(verifySeedReady(new PrismaClient())).resolves.toBeUndefined();

      await expect(
        Promise.all([
          database.project.count(),
          database.contentItem.count(),
          database.rubric.count(),
        ]),
      ).resolves.toEqual(before);
    } finally {
      await database.$disconnect();
    }
  });
});
