import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ConflictError, NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import {
  type ContentItem,
  ContentItemId,
  createContentItem,
  makeContentTitle,
  makeContentType,
  publishContent,
  reviseContent,
} from "@/domain/content";
import { makeSlug, type Slug } from "@/domain/shared";
import { PrismaContentRepository } from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const T0 = new Date("2026-07-19T00:00:00.000Z");

function content(id: string, slug: string): ContentItem {
  const type = makeContentType("PLAYBOOK");
  const title = makeContentTitle("A Playbook");
  const s = makeSlug(slug);
  if (!type.ok) throw type.error;
  if (!title.ok) throw title.error;
  if (!s.ok) throw s.error;
  return createContentItem({
    id: ContentItemId.unsafe(id),
    type: type.value,
    slug: s.value as Slug,
    title: title.value,
    now: T0,
  });
}

async function expectThrown(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("expected the operation to throw");
}

let prisma: PrismaClient;
let repo: PrismaContentRepository;

beforeAll(() => {
  prisma = createTestPrisma();
  repo = new PrismaContentRepository(prisma);
});
afterAll(async () => {
  await prisma.$disconnect();
});
beforeEach(async () => {
  await resetDatabase(prisma);
});

describe("PrismaContentRepository", () => {
  it("inserts and retrieves by id and slug", async () => {
    await repo.insert(content("cnt_AAAAAAA1", "brand-doc"));
    const slug = makeSlug("brand-doc");
    if (!slug.ok) throw slug.error;
    expect((await repo.findById(ContentItemId.unsafe("cnt_AAAAAAA1")))?.slug).toBe("brand-doc");
    expect((await repo.findBySlug(slug.value))?.id).toBe("cnt_AAAAAAA1");
    expect(await repo.existsBySlug(slug.value)).toBe(true);
  });

  it("enforces slug uniqueness at the database (CONFLICT)", async () => {
    await repo.insert(content("cnt_AAAAAAA1", "dupe-slug"));
    const error = await expectThrown(repo.insert(content("cnt_AAAAAAA2", "dupe-slug")));
    expect(error).toBeInstanceOf(ConflictError);
  });

  it("persists publish and revision with monotonic version and lockVersion", async () => {
    await repo.insert(content("cnt_AAAAAAA1", "versioned"));
    const created = await repo.findById(ContentItemId.unsafe("cnt_AAAAAAA1"));
    if (!created) throw new Error("expected content");

    const published = publishContent(created, T0);
    if (!published.ok) throw published.error;
    await repo.update(published.value);
    const afterPublish = await repo.findById(created.id);
    expect(afterPublish?.status).toBe("PUBLISHED");
    expect(afterPublish?.lockVersion).toBe(2);

    if (!afterPublish) throw new Error("expected content");
    const revised = reviseContent(afterPublish, T0);
    if (!revised.ok) throw revised.error;
    await repo.update(revised.value);
    const final = await repo.findById(created.id);
    expect(final?.version).toBe(2); // domain revision
    expect(final?.status).toBe("DRAFT");
    expect(final?.lockVersion).toBe(3); // concurrency token
  });

  it("rejects updating (publishing) missing content — does not create it", async () => {
    const missing = content("cnt_MISSING1", "missing");
    const published = publishContent(missing, T0);
    if (!published.ok) throw published.error;
    const error = await expectThrown(repo.update(published.value));
    expect(error).toBeInstanceOf(NotFoundError);
    expect(await repo.findById(ContentItemId.unsafe("cnt_MISSING1"))).toBeNull();
  });

  it("rejects a stale content write", async () => {
    await repo.insert(content("cnt_AAAAAAA1", "race"));
    const a = await repo.findById(ContentItemId.unsafe("cnt_AAAAAAA1"));
    const b = await repo.findById(ContentItemId.unsafe("cnt_AAAAAAA1"));
    if (!a || !b) throw new Error("expected content");
    const first = publishContent(a, T0);
    if (!first.ok) throw first.error;
    await repo.update(first.value);
    const stale = publishContent(b, T0);
    if (!stale.ok) throw stale.error;
    expect(await expectThrown(repo.update(stale.value))).toBeInstanceOf(OptimisticConcurrencyError);
  });
});
