import { err, ok, type Result } from "@/lib/result";
import {
  ContentItemId,
  type ContentRepository,
  createContentItem as createContentItemAggregate,
  makeContentTitle,
  makeContentType,
} from "@/domain/content";
import { type InvalidValueError, makeSlug } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import type { Clock } from "../shared/clock";
import { type RepositoryError, SlugAlreadyExistsError } from "../shared/errors";
import type { IdGenerator } from "../shared/id-generator";
import { type ContentItemView, toContentItemView } from "./content-view";

export interface CreateContentItemDeps {
  readonly content: ContentRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

export interface CreateContentItemInput {
  readonly type: string;
  readonly slug: string;
  readonly title: string;
}

export type CreateContentItemResult = Result<
  ContentItemView,
  InvalidValueError | SlugAlreadyExistsError | RepositoryError
>;

/**
 * Authoring a knowledge-base item. Slug uniqueness is checked before save.
 * NOTE: the check-then-save is not atomic in memory; the persistence adapter
 * must enforce slug uniqueness with a unique constraint (see APPLICATION_ARCHITECTURE).
 */
export async function createContentItem(
  deps: CreateContentItemDeps,
  input: CreateContentItemInput,
): Promise<CreateContentItemResult> {
  const type = makeContentType(input.type);
  if (!type.ok) return type;
  const slug = makeSlug(input.slug);
  if (!slug.ok) return slug;
  const title = makeContentTitle(input.title);
  if (!title.ok) return title;

  const exists = await attempt("content.existsBySlug", () => deps.content.existsBySlug(slug.value));
  if (!exists.ok) return exists;
  if (exists.value) return err(new SlugAlreadyExistsError(slug.value));

  const item = createContentItemAggregate({
    id: ContentItemId.unsafe(deps.ids.generate(ContentItemId.prefix)),
    type: type.value,
    slug: slug.value,
    title: title.value,
    now: deps.clock.now(),
  });

  const saved = await attempt("content.save", () => deps.content.save(item));
  if (!saved.ok) return saved;
  return ok(toContentItemView(item));
}
