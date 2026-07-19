import { ConflictError } from "@/lib/errors";
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
import { RepositoryError, SlugAlreadyExistsError } from "../shared/errors";
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
 * Authoring a knowledge-base item. Slug uniqueness is pre-checked for a clear
 * error, but the DATABASE unique constraint is authoritative: a concurrent create
 * that slips past the pre-check surfaces as a CONFLICT from the repository, which
 * is mapped to the same `SlugAlreadyExistsError`. The pre-check is never relied on
 * alone (see docs/PERSISTENCE_ARCHITECTURE.md).
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

  try {
    await deps.content.insert(item);
  } catch (error) {
    // A conflict means the slug was taken between the pre-check and the write
    // (the DB unique constraint is authoritative); map it to the expected failure.
    // ContentItem ids are application-generated and never collide in practice, so
    // the only realistic conflict here is the slug. `ConflictError` is a neutral
    // shared-kernel type — no infrastructure error class is imported.
    if (error instanceof ConflictError) {
      return err(new SlugAlreadyExistsError(slug.value));
    }
    return err(new RepositoryError("content.insert", { cause: error }));
  }
  return ok(toContentItemView(item));
}
