import type {
  ContentItem,
  ContentItemId,
  ContentStatus,
  ContentTitle,
  ContentType,
} from "@/domain/content";
import type { Slug } from "@/domain/shared";

/**
 * Application-owned projection of a knowledge-base item. Decouples delivery from
 * the `ContentItem` aggregate. All fields are relevant to rendering/listing.
 */
export interface ContentItemView {
  readonly id: ContentItemId;
  readonly type: ContentType;
  readonly slug: Slug;
  readonly title: ContentTitle;
  readonly status: ContentStatus;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function toContentItemView(item: ContentItem): ContentItemView {
  return {
    id: item.id,
    type: item.type,
    slug: item.slug,
    title: item.title,
    status: item.status,
    version: item.version,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
