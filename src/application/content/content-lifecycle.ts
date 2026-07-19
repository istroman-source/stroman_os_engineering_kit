import { err, ok, type Result } from "@/lib/result";
import {
  archiveContent as archive,
  type ContentItem,
  type ContentItemId,
  type ContentRepository,
  publishContent as publish,
  reviseContent as revise,
} from "@/domain/content";
import type { InvalidStateTransitionError } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import type { Clock } from "../shared/clock";
import { NotFoundError, type RepositoryError } from "../shared/errors";
import { type ContentItemView, toContentItemView } from "./content-view";

export interface ContentLifecycleDeps {
  readonly content: ContentRepository;
  readonly clock: Clock;
}

export interface ContentLifecycleInput {
  readonly contentItemId: ContentItemId;
}

export type ContentLifecycleResult = Result<
  ContentItemView,
  NotFoundError | InvalidStateTransitionError | RepositoryError
>;

type DomainTransition = (
  item: ContentItem,
  now: Date,
) => Result<ContentItem, InvalidStateTransitionError>;

async function runTransition(
  deps: ContentLifecycleDeps,
  input: ContentLifecycleInput,
  transition: DomainTransition,
): Promise<ContentLifecycleResult> {
  const loaded = await attempt("content.findById", () =>
    deps.content.findById(input.contentItemId),
  );
  if (!loaded.ok) return loaded;
  const item = loaded.value;
  if (!item) return err(new NotFoundError("ContentItem", input.contentItemId));

  const transitioned = transition(item, deps.clock.now());
  if (!transitioned.ok) return transitioned;

  const saved = await attempt("content.save", () => deps.content.save(transitioned.value));
  if (!saved.ok) return saved;
  return ok(toContentItemView(transitioned.value));
}

export function publishContentItem(
  deps: ContentLifecycleDeps,
  input: ContentLifecycleInput,
): Promise<ContentLifecycleResult> {
  return runTransition(deps, input, publish);
}

export function reviseContentItem(
  deps: ContentLifecycleDeps,
  input: ContentLifecycleInput,
): Promise<ContentLifecycleResult> {
  return runTransition(deps, input, revise);
}

export function archiveContentItem(
  deps: ContentLifecycleDeps,
  input: ContentLifecycleInput,
): Promise<ContentLifecycleResult> {
  return runTransition(deps, input, archive);
}
