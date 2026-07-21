import { OptimisticConcurrencyError } from "@/lib/errors";
import { err, ok } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import {
  archiveSource,
  pauseSource,
  resumeSource,
  type KnowledgeSourceRepository,
  type KnowledgeSourceId,
} from "@/domain/knowledge-acquisition";
import { attemptUpdate } from "../shared/attempt";
import { loadOwnedKnowledgeSource } from "./knowledge-source-access";
import { toKnowledgeSourceView } from "./knowledge-acquisition-view";
export async function manageKnowledgeSource(
  deps: { knowledgeSources: KnowledgeSourceRepository },
  input: {
    actorId: OwnerId;
    knowledgeSourceId: KnowledgeSourceId;
    expectedVersion: number;
    action: "pause" | "resume" | "archive";
  },
) {
  const loaded = await loadOwnedKnowledgeSource(
    deps.knowledgeSources,
    input.actorId,
    input.knowledgeSourceId,
    `knowledgeSource.${input.action}`,
  );
  if (!loaded.ok) return loaded;
  if (loaded.value.lockVersion !== input.expectedVersion)
    return err(new OptimisticConcurrencyError());
  const made =
    input.action === "pause"
      ? pauseSource(loaded.value)
      : input.action === "resume"
        ? resumeSource(loaded.value)
        : archiveSource(loaded.value);
  if (!made.ok) return made;
  const saved = await attemptUpdate(`knowledgeSource.${input.action}`, () =>
    deps.knowledgeSources.update(made.value),
  );
  return saved.ok ? ok(toKnowledgeSourceView(made.value)) : saved;
}
