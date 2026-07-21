import { ok } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import {
  createKnowledgeSource as createAggregate,
  KnowledgeSourceId,
  type KnowledgeSourceRepository,
  type SourceReliability,
  type SourceType,
} from "@/domain/knowledge-acquisition";
import type { Clock, IdGenerator } from "../shared";
import { attempt } from "../shared/attempt";
import { toKnowledgeSourceView } from "./knowledge-acquisition-view";
export async function createKnowledgeSource(
  deps: { knowledgeSources: KnowledgeSourceRepository; ids: IdGenerator; clock: Clock },
  input: {
    actorId: OwnerId;
    name: string;
    sourceType: SourceType;
    origin?: string | null;
    sourceReliability: SourceReliability;
  },
) {
  const made = createAggregate({
    ...input,
    id: KnowledgeSourceId.unsafe(deps.ids.generate(KnowledgeSourceId.prefix)),
    ownerId: input.actorId,
    now: deps.clock.now(),
  });
  if (!made.ok) return made;
  const saved = await attempt("knowledgeSource.insert", () =>
    deps.knowledgeSources.insert(made.value),
  );
  return saved.ok ? ok(toKnowledgeSourceView(made.value)) : saved;
}
