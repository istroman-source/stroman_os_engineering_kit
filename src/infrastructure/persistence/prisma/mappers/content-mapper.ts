import type { ContentItem as ContentRow } from "@prisma/client";
import { type ContentItem, ContentItemId, makeContentTitle } from "@/domain/content";
import { makeSlug } from "@/domain/shared";
import { orThrowMapping } from "./shared";

export function toContentItem(row: ContentRow): ContentItem {
  return {
    id: orThrowMapping(ContentItemId.parse(row.id), `content.id="${row.id}"`),
    type: row.type,
    slug: orThrowMapping(makeSlug(row.slug), `content.slug="${row.slug}"`),
    title: orThrowMapping(makeContentTitle(row.title), "content.title"),
    status: row.status,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lockVersion: row.lockVersion,
  };
}

export function toContentFields(item: ContentItem) {
  return {
    id: item.id,
    type: item.type,
    slug: item.slug,
    title: item.title,
    status: item.status,
    version: item.version,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lockVersion: item.lockVersion,
  };
}
