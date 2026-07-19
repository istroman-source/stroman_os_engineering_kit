import { describe, expect, it } from "vitest";
import { InvalidStateTransitionError, makeSlug } from "../shared";
import { ContentItemId } from "./content-id";
import {
  archiveContent,
  type ContentItem,
  createContentItem,
  publishContent,
  reviseContent,
  unpublishContent,
} from "./content-item";
import { makeContentTitle } from "./content-title";
import { makeContentType } from "./content-type";

const T0 = new Date("2026-07-17T00:00:00.000Z");
const T1 = new Date("2026-07-18T00:00:00.000Z");

function make(): ContentItem {
  const id = ContentItemId.unsafe("cnt_ABCDEF12");
  const type = makeContentType("PLAYBOOK");
  const title = makeContentTitle("Restaurant Brand Documentary");
  const slug = makeSlug("restaurant-brand-documentary");
  if (!type.ok) throw type.error;
  if (!title.ok) throw title.error;
  if (!slug.ok) throw slug.error;
  return createContentItem({ id, type: type.value, slug: slug.value, title: title.value, now: T0 });
}

describe("ContentType", () => {
  it("accepts known types and rejects unknown ones", () => {
    expect(makeContentType("RUBRIC").ok).toBe(true);
    expect(makeContentType("VIDEO").ok).toBe(false);
  });
});

describe("ContentItem lifecycle & versioning", () => {
  it("is created DRAFT at version 1", () => {
    const item = make();
    expect(item.status).toBe("DRAFT");
    expect(item.version).toBe(1);
  });

  it("publishes, unpublishes, and archives via legal transitions", () => {
    const published = publishContent(make(), T1);
    expect(published.ok && published.value.status).toBe("PUBLISHED");
    const back = published.ok ? unpublishContent(published.value, T1) : published;
    expect(back.ok && back.value.status).toBe("DRAFT");
    const archived = published.ok ? archiveContent(published.value, T1) : published;
    expect(archived.ok && archived.value.status).toBe("ARCHIVED");
  });

  it("rejects illegal transitions (archived is terminal)", () => {
    const archived = archiveContent(make(), T1);
    expect(archived.ok).toBe(true);
    if (archived.ok) {
      const result = publishContent(archived.value, T1);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBeInstanceOf(InvalidStateTransitionError);
    }
  });

  it("revise increments version and returns to DRAFT", () => {
    const published = publishContent(make(), T1);
    expect(published.ok).toBe(true);
    if (published.ok) {
      const revised = reviseContent(published.value, T1);
      expect(revised.ok).toBe(true);
      if (revised.ok) {
        expect(revised.value.version).toBe(2);
        expect(revised.value.status).toBe("DRAFT");
      }
    }
  });

  it("cannot revise an archived item", () => {
    const archived = archiveContent(make(), T1);
    if (archived.ok) {
      expect(reviseContent(archived.value, T1).ok).toBe(false);
    }
  });
});
