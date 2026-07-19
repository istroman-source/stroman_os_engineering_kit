import { describe, expect, it } from "vitest";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import { InMemoryContentRepository } from "../../../test/adapters/in-memory-repositories";
import { NotFoundError, RepositoryError, SlugAlreadyExistsError } from "../shared/errors";
import { archiveContentItem, publishContentItem, reviseContentItem } from "./content-lifecycle";
import { createContentItem } from "./create-content-item";
import { getContentItemBySlug } from "./get-content-item-by-slug";

function deps() {
  return {
    content: new InMemoryContentRepository(),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(new Date("2026-07-19T00:00:00.000Z")),
  };
}

const base = { type: "PLAYBOOK", slug: "signature-dish-reel", title: "Signature Dish Reel" };

describe("createContentItem", () => {
  it("creates a DRAFT item at version 1", async () => {
    const result = await createContentItem(deps(), base);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("DRAFT");
      expect(result.value.version).toBe(1);
    }
  });

  it("rejects a duplicate slug", async () => {
    const d = deps();
    await createContentItem(d, base);
    const result = await createContentItem(d, base);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(SlugAlreadyExistsError);
  });

  it("rejects an unknown content type", async () => {
    const result = await createContentItem(deps(), { ...base, type: "VIDEO" });
    expect(result.ok).toBe(false);
  });
});

describe("getContentItemBySlug", () => {
  it("returns a stored item", async () => {
    const d = deps();
    await createContentItem(d, base);
    const result = await getContentItemBySlug(d, { slug: base.slug });
    expect(result.ok && result.value.slug).toBe(base.slug);
  });

  it("reports not found", async () => {
    const result = await getContentItemBySlug(deps(), { slug: "missing-item" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
  });
});

describe("content lifecycle", () => {
  it("publishes, then revising increments version and returns to DRAFT", async () => {
    const d = deps();
    const created = await createContentItem(d, base);
    if (!created.ok) throw created.error;
    const published = await publishContentItem(d, {
      contentItemId: created.value.id,
      expectedVersion: created.value.lockVersion,
    });
    if (!published.ok) throw published.error;
    expect(published.value.status).toBe("PUBLISHED");
    const revised = await reviseContentItem(d, {
      contentItemId: created.value.id,
      expectedVersion: published.value.lockVersion,
    });
    expect(revised.ok && revised.value.version).toBe(2);
    expect(revised.ok && revised.value.status).toBe("DRAFT");
  });

  it("cannot publish an archived item, and does not persist the change", async () => {
    const d = deps();
    const created = await createContentItem(d, base);
    if (!created.ok) throw created.error;
    const archived = await archiveContentItem(d, {
      contentItemId: created.value.id,
      expectedVersion: created.value.lockVersion,
    });
    if (!archived.ok) throw archived.error;
    const result = await publishContentItem(d, {
      contentItemId: created.value.id,
      expectedVersion: archived.value.lockVersion,
    });
    expect(result.ok).toBe(false);
    const stored = await d.content.findById(created.value.id);
    expect(stored?.status).toBe("ARCHIVED");
  });

  it("translates a repository failure safely", async () => {
    const d = deps();
    d.content.fail = true;
    const result = await createContentItem(d, base);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(RepositoryError);
  });
});
