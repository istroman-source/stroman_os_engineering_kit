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
  save(item: ContentItem): Promise<void>;
}
