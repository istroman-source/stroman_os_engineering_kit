import { err, ok, type Result } from "@/lib/result";
import type { ContentRepository } from "@/domain/content";
import { makeSlug } from "@/domain/shared";
import type { InvalidValueError } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import { NotFoundError, type RepositoryError } from "../shared/errors";
import { type ContentItemView, toContentItemView } from "./content-view";

export interface GetContentItemBySlugDeps {
  readonly content: ContentRepository;
}

export interface GetContentItemBySlugInput {
  readonly slug: string;
}

export type GetContentItemBySlugResult = Result<
  ContentItemView,
  InvalidValueError | NotFoundError | RepositoryError
>;

export async function getContentItemBySlug(
  deps: GetContentItemBySlugDeps,
  input: GetContentItemBySlugInput,
): Promise<GetContentItemBySlugResult> {
  const slug = makeSlug(input.slug);
  if (!slug.ok) return slug;

  const loaded = await attempt("content.findBySlug", () => deps.content.findBySlug(slug.value));
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("ContentItem", slug.value));
  return ok(toContentItemView(loaded.value));
}
