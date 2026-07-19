import type { Slug } from "../shared";
import type { ContentItem } from "./content-item";
import type { ContentItemId } from "./content-id";

/**
 * Persistence contract owned by the Content domain. `existsBySlug` supports the
 * slug-uniqueness invariant, which spans items and so is checked here rather than
 * inside a single aggregate.
 */
export interface ContentRepository {
  findById(id: ContentItemId): Promise<ContentItem | null>;
  findBySlug(slug: Slug): Promise<ContentItem | null>;
  existsBySlug(slug: Slug): Promise<boolean>;
  /** Create a new content item. Rejects if the id already exists. */
  insert(item: ContentItem): Promise<void>;
  /**
   * Update an existing content item. Rejects if the id does not exist and rejects
   * a stale write (optimistic concurrency on `lockVersion`).
   */
  update(item: ContentItem): Promise<void>;
}
