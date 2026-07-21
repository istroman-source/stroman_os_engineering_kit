import { ok } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import {
  AcquisitionRunId,
  createAcquisitionRun as createAggregate,
  type AcquisitionRunRepository,
  type KnowledgeSourceId,
  type KnowledgeSourceRepository,
} from "@/domain/knowledge-acquisition";
import type { Clock, IdGenerator } from "../shared";
import { attempt } from "../shared/attempt";
import { loadOwnedKnowledgeSource } from "./knowledge-source-access";
import { toAcquisitionRunView } from "./knowledge-acquisition-view";
export async function createAcquisitionRun(
  deps: {
    knowledgeSources: KnowledgeSourceRepository;
    acquisitionRuns: AcquisitionRunRepository;
    ids: IdGenerator;
    clock: Clock;
  },
  input: {
    actorId: OwnerId;
    knowledgeSourceId: KnowledgeSourceId;
    extractor: string;
    extractorVersion: string;
  },
) {
  const source = await loadOwnedKnowledgeSource(
    deps.knowledgeSources,
    input.actorId,
    input.knowledgeSourceId,
    "acquisitionRun.create",
  );
  if (!source.ok) return source;
  const made = createAggregate({
    ...input,
    id: AcquisitionRunId.unsafe(deps.ids.generate(AcquisitionRunId.prefix)),
    ownerId: input.actorId,
    now: deps.clock.now(),
  });
  if (!made.ok) return made;
  const saved = await attempt("acquisitionRun.insert", () =>
    deps.acquisitionRuns.insert(made.value),
  );
  return saved.ok ? ok(toAcquisitionRunView(made.value)) : saved;
}
