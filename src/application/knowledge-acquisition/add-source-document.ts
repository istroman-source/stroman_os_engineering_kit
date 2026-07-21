import { ConflictError } from "@/lib/errors";
import { err, ok } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import {
  createSourceDocument,
  SourceDocumentId,
  type DocumentType,
  type KnowledgeSourceId,
  type KnowledgeSourceRepository,
  type SourceDocumentRepository,
} from "@/domain/knowledge-acquisition";
import type { Clock, IdGenerator } from "../shared";
import { attempt } from "../shared/attempt";
import { RepositoryError } from "../shared/errors";
import { loadOwnedKnowledgeSource } from "./knowledge-source-access";
import { toSourceDocumentView } from "./knowledge-acquisition-view";
export async function addSourceDocument(
  deps: {
    knowledgeSources: KnowledgeSourceRepository;
    sourceDocuments: SourceDocumentRepository;
    ids: IdGenerator;
    clock: Clock;
  },
  input: {
    actorId: OwnerId;
    knowledgeSourceId: KnowledgeSourceId;
    documentType: DocumentType;
    contentHash: string;
    title: string;
    mediaType?: string | null;
    byteSize?: number | null;
  },
) {
  const source = await loadOwnedKnowledgeSource(
    deps.knowledgeSources,
    input.actorId,
    input.knowledgeSourceId,
    "sourceDocument.create",
  );
  if (!source.ok) return source;
  const existing = await attempt("sourceDocument.findBySourceAndHash", () =>
    deps.sourceDocuments.findBySourceAndHash(input.knowledgeSourceId, input.contentHash),
  );
  if (!existing.ok) return existing;
  if (existing.value) return ok(toSourceDocumentView(existing.value));
  const made = createSourceDocument({
    ...input,
    id: SourceDocumentId.unsafe(deps.ids.generate(SourceDocumentId.prefix)),
    ownerId: input.actorId,
    now: deps.clock.now(),
  });
  if (!made.ok) return made;
  try {
    await deps.sourceDocuments.insert(made.value);
  } catch (cause) {
    if (!(cause instanceof ConflictError))
      return err(new RepositoryError("sourceDocument.insert", { cause }));
    const raced = await attempt("sourceDocument.findBySourceAndHash", () =>
      deps.sourceDocuments.findBySourceAndHash(input.knowledgeSourceId, input.contentHash),
    );
    if (!raced.ok) return raced;
    if (!raced.value) return err(new RepositoryError("sourceDocument.insertRace"));
    return ok(toSourceDocumentView(raced.value));
  }
  return ok(toSourceDocumentView(made.value));
}
