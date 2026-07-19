import { err, ok, type Result } from "@/lib/result";
import { defineStateMachine, InvalidStateTransitionError, type Slug } from "../shared";
import type { ContentItemId } from "./content-id";
import type { ContentTitle } from "./content-title";
import type { ContentType } from "./content-type";

/** Publication lifecycle for a knowledge-base item. */
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

const lifecycle = defineStateMachine<ContentStatus>({
  DRAFT: ["PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["DRAFT", "ARCHIVED"],
  ARCHIVED: [],
});

/**
 * A reusable knowledge-base entry. Aggregate root of the Content domain.
 * `version` is monotonic: a revision increments it and returns the item to DRAFT,
 * so a new revision must be re-published.
 */
export interface ContentItem {
  readonly id: ContentItemId;
  readonly type: ContentType;
  readonly slug: Slug;
  readonly title: ContentTitle;
  readonly status: ContentStatus;
  /** Domain revision count (increments on `reviseContent`). Not a concurrency token. */
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /**
   * Optimistic-concurrency token, managed by the persistence layer — distinct
   * from `version` (the domain revision). Used to reject stale writes.
   */
  readonly lockVersion: number;
}

export interface CreateContentItemInput {
  readonly id: ContentItemId;
  readonly type: ContentType;
  readonly slug: Slug;
  readonly title: ContentTitle;
  readonly now: Date;
}

export function createContentItem(input: CreateContentItemInput): ContentItem {
  return {
    id: input.id,
    type: input.type,
    slug: input.slug,
    title: input.title,
    status: "DRAFT",
    version: 1,
    createdAt: input.now,
    updatedAt: input.now,
    lockVersion: 1,
  };
}

function transition(
  item: ContentItem,
  to: ContentStatus,
  now: Date,
): Result<ContentItem, InvalidStateTransitionError> {
  const check = lifecycle.assert("ContentItem", item.status, to);
  if (!check.ok) return check;
  return ok({ ...item, status: to, updatedAt: now });
}

export function publishContent(
  item: ContentItem,
  now: Date,
): Result<ContentItem, InvalidStateTransitionError> {
  return transition(item, "PUBLISHED", now);
}

export function unpublishContent(
  item: ContentItem,
  now: Date,
): Result<ContentItem, InvalidStateTransitionError> {
  return transition(item, "DRAFT", now);
}

export function archiveContent(
  item: ContentItem,
  now: Date,
): Result<ContentItem, InvalidStateTransitionError> {
  return transition(item, "ARCHIVED", now);
}

/** Begin a new revision: increment version and return to DRAFT. Not allowed once archived. */
export function reviseContent(
  item: ContentItem,
  now: Date,
): Result<ContentItem, InvalidStateTransitionError> {
  if (item.status === "ARCHIVED") {
    return err(new InvalidStateTransitionError("ContentItem", "ARCHIVED", "DRAFT"));
  }
  return ok({ ...item, status: "DRAFT", version: item.version + 1, updatedAt: now });
}
