"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/primitives/button";
import { errorStatus, friendlyError } from "@/ui/auth/api-client";
import {
  createEntity,
  createInsight,
  createMemory,
  createRelationship,
  createSource,
  type Entity,
  type EntityKnowledge,
  getEntityKnowledge,
  listEntities,
  listSources,
  type Source,
} from "./memory-api";

const input =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const card = "border-border bg-card flex flex-col gap-3 rounded-lg border p-4";

/**
 * Minimal manual-entry interface for the creative memory graph (for testing the
 * Memory Engine). Create entities, sources, memories, relationships, and
 * memory-cited insights, then inspect an entity's full, traceable knowledge.
 */
export function KnowledgeWorkspace() {
  const router = useRouter();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [knowledge, setKnowledge] = useState<EntityKnowledge | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fail = useCallback(
    (err: unknown) => {
      if (errorStatus(err) === 401) {
        router.replace("/login");
        return;
      }
      setError(friendlyError(err));
    },
    [router],
  );

  const refreshLists = useCallback(async () => {
    try {
      const [e, s] = await Promise.all([listEntities(), listSources()]);
      setEntities(e);
      setSources(s);
    } catch (err) {
      fail(err);
    }
  }, [fail]);

  const loadKnowledge = useCallback(
    async (entityId: string) => {
      if (!entityId) {
        setKnowledge(null);
        return;
      }
      try {
        setKnowledge(await getEntityKnowledge(entityId));
      } catch (err) {
        fail(err);
      }
    },
    [fail],
  );

  // Effects set state only inside promise callbacks (never synchronously in the
  // effect body), which is the pattern the rules-of-hooks lint allows.
  useEffect(() => {
    let active = true;
    Promise.all([listEntities(), listSources()])
      .then(([e, s]) => {
        if (!active) return;
        setEntities(e);
        setSources(s);
      })
      .catch((err) => {
        if (active) fail(err);
      });
    return () => {
      active = false;
    };
  }, [fail]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    getEntityKnowledge(selectedId)
      .then((k) => {
        if (active) setKnowledge(k);
      })
      .catch((err) => {
        if (active) fail(err);
      });
    return () => {
      active = false;
    };
  }, [selectedId, fail]);

  async function guarded(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      await refreshLists();
      if (selectedId) await loadKnowledge(selectedId);
    } catch (err) {
      fail(err);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Creative Memory</h1>
        <p className="text-muted-foreground text-sm">
          Capture structured creative knowledge — entities, facts, relationships, sources, and
          insights with traceable evidence.
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <EntityForm onSubmit={(name, kind) => guarded(() => createEntity(name, kind))} />
        <SourceForm onSubmit={(v) => guarded(() => createSource(v))} />
        <MemoryForm
          entities={entities}
          sources={sources}
          onSubmit={(v) => guarded(() => createMemory(v))}
        />
        <RelationshipForm
          entities={entities}
          onSubmit={(v) => guarded(() => createRelationship(v))}
        />
      </div>

      <section className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Inspect an entity’s knowledge</span>
          <select
            className={input}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            aria-label="Select entity"
          >
            <option value="">Select an entity…</option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name} ({entity.kind})
              </option>
            ))}
          </select>
        </label>

        {knowledge ? (
          <>
            <InsightForm
              memories={knowledge.memories.map((m) => m.memory)}
              onSubmit={(v) => guarded(() => createInsight(v))}
            />
            <KnowledgePanel knowledge={knowledge} />
          </>
        ) : null}
      </section>
    </div>
  );
}

function EntityForm({ onSubmit }: { onSubmit: (name: string, kind: string) => void }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState("");
  return (
    <form
      className={card}
      aria-label="New entity"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !kind.trim()) return;
        onSubmit(name.trim(), kind.trim());
        setName("");
        setKind("");
      }}
    >
      <h2 className="text-sm font-semibold">New entity</h2>
      <input
        className={input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (e.g. Michael Kramer)"
        aria-label="Entity name"
      />
      <input
        className={input}
        value={kind}
        onChange={(e) => setKind(e.target.value)}
        placeholder="Kind (e.g. person, organization)"
        aria-label="Entity kind"
      />
      <div>
        <Button type="submit" size="sm">
          Add entity
        </Button>
      </div>
    </form>
  );
}

function SourceForm({
  onSubmit,
}: {
  onSubmit: (v: {
    label: string;
    sourceType: string;
    url?: string | null;
    detail?: string | null;
  }) => void;
}) {
  const [label, setLabel] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [url, setUrl] = useState("");
  return (
    <form
      className={card}
      aria-label="New source"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (!label.trim() || !sourceType.trim()) return;
        onSubmit({ label: label.trim(), sourceType: sourceType.trim(), url: url.trim() || null });
        setLabel("");
        setSourceType("");
        setUrl("");
      }}
    >
      <h2 className="text-sm font-semibold">New source</h2>
      <input
        className={input}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label (e.g. Founder interview)"
        aria-label="Source label"
      />
      <input
        className={input}
        value={sourceType}
        onChange={(e) => setSourceType(e.target.value)}
        placeholder="Type (e.g. interview, article)"
        aria-label="Source type"
      />
      <input
        className={input}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL (optional)"
        aria-label="Source url"
      />
      <div>
        <Button type="submit" size="sm">
          Add source
        </Button>
      </div>
    </form>
  );
}

function MemoryForm({
  entities,
  sources,
  onSubmit,
}: {
  entities: Entity[];
  sources: Source[];
  onSubmit: (v: { entityId: string; sourceId?: string | null; content: string }) => void;
}) {
  const [entityId, setEntityId] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [content, setContent] = useState("");
  return (
    <form
      className={card}
      aria-label="New memory"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (!entityId || !content.trim()) return;
        onSubmit({ entityId, sourceId: sourceId || null, content: content.trim() });
        setContent("");
      }}
    >
      <h2 className="text-sm font-semibold">New memory (fact)</h2>
      <select
        className={input}
        value={entityId}
        onChange={(e) => setEntityId(e.target.value)}
        aria-label="Memory entity"
      >
        <option value="">About which entity?</option>
        {entities.map((en) => (
          <option key={en.id} value={en.id}>
            {en.name}
          </option>
        ))}
      </select>
      <select
        className={input}
        value={sourceId}
        onChange={(e) => setSourceId(e.target.value)}
        aria-label="Memory source"
      >
        <option value="">No source</option>
        {sources.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <textarea
        className={input}
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Fact / observation"
        aria-label="Memory content"
      />
      <div>
        <Button type="submit" size="sm">
          Add memory
        </Button>
      </div>
    </form>
  );
}

function RelationshipForm({
  entities,
  onSubmit,
}: {
  entities: Entity[];
  onSubmit: (v: { fromEntityId: string; toEntityId: string; relationType: string }) => void;
}) {
  const [fromEntityId, setFrom] = useState("");
  const [toEntityId, setTo] = useState("");
  const [relationType, setType] = useState("");
  return (
    <form
      className={card}
      aria-label="New relationship"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (!fromEntityId || !toEntityId || !relationType.trim()) return;
        onSubmit({ fromEntityId, toEntityId, relationType: relationType.trim() });
        setType("");
      }}
    >
      <h2 className="text-sm font-semibold">New relationship</h2>
      <select
        className={input}
        value={fromEntityId}
        onChange={(e) => setFrom(e.target.value)}
        aria-label="Relationship from"
      >
        <option value="">From entity</option>
        {entities.map((en) => (
          <option key={en.id} value={en.id}>
            {en.name}
          </option>
        ))}
      </select>
      <input
        className={input}
        value={relationType}
        onChange={(e) => setType(e.target.value)}
        placeholder="Relation (e.g. founder_of)"
        aria-label="Relationship type"
      />
      <select
        className={input}
        value={toEntityId}
        onChange={(e) => setTo(e.target.value)}
        aria-label="Relationship to"
      >
        <option value="">To entity</option>
        {entities.map((en) => (
          <option key={en.id} value={en.id}>
            {en.name}
          </option>
        ))}
      </select>
      <div>
        <Button type="submit" size="sm">
          Add relationship
        </Button>
      </div>
    </form>
  );
}

function InsightForm({
  memories,
  onSubmit,
}: {
  memories: Array<{ id: string; content: string }>;
  onSubmit: (v: {
    statement: string;
    confidence: number;
    evidence?: string | null;
    memoryIds: string[];
  }) => void;
}) {
  const [statement, setStatement] = useState("");
  const [confidencePct, setConfidencePct] = useState(70);
  const [evidence, setEvidence] = useState("");
  const [memoryIds, setMemoryIds] = useState<string[]>([]);

  function toggle(id: string) {
    setMemoryIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  return (
    <form
      className={card}
      aria-label="New insight"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (!statement.trim() || memoryIds.length < 1) return;
        onSubmit({
          statement: statement.trim(),
          confidence: Math.min(1, Math.max(0, confidencePct / 100)),
          evidence: evidence.trim() || null,
          memoryIds,
        });
        setStatement("");
        setEvidence("");
        setMemoryIds([]);
      }}
    >
      <h2 className="text-sm font-semibold">New insight (must cite ≥1 memory)</h2>
      <textarea
        className={input}
        rows={2}
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        placeholder="Insight statement"
        aria-label="Insight statement"
      />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Confidence: {confidencePct}%</span>
        <input
          type="range"
          min={0}
          max={100}
          value={confidencePct}
          onChange={(e) => setConfidencePct(Number(e.target.value))}
          aria-label="Insight confidence"
        />
      </label>
      <textarea
        className={input}
        rows={2}
        value={evidence}
        onChange={(e) => setEvidence(e.target.value)}
        placeholder="Evidence / reasoning (optional)"
        aria-label="Insight evidence"
      />
      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm font-medium">Cite memories</legend>
        {memories.length === 0 ? (
          <p className="text-muted-foreground text-xs">No memories for this entity yet.</p>
        ) : (
          memories.map((m) => (
            <label key={m.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={memoryIds.includes(m.id)}
                onChange={() => toggle(m.id)}
                aria-label={`Cite: ${m.content}`}
              />
              <span>{m.content}</span>
            </label>
          ))
        )}
      </fieldset>
      <div>
        <Button type="submit" size="sm" disabled={memoryIds.length < 1 || statement.trim() === ""}>
          Add insight
        </Button>
      </div>
    </form>
  );
}

function KnowledgePanel({ knowledge }: { knowledge: EntityKnowledge }) {
  return (
    <div className="flex flex-col gap-4" aria-label="Entity knowledge">
      <h2 className="text-lg font-semibold">
        {knowledge.entity.name}{" "}
        <span className="text-muted-foreground text-xs uppercase">{knowledge.entity.kind}</span>
      </h2>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Memories &amp; sources</h3>
        {knowledge.memories.length === 0 ? (
          <p className="text-muted-foreground text-sm">No memories yet.</p>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Memories">
            {knowledge.memories.map(({ memory, source }) => (
              <li key={memory.id} className={card}>
                <span className="text-sm">{memory.content}</span>
                <span className="text-muted-foreground text-xs">
                  Source: {source ? `${source.label} (${source.sourceType})` : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Relationships</h3>
        {knowledge.relationships.length === 0 ? (
          <p className="text-muted-foreground text-sm">No relationships yet.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm" aria-label="Relationships">
            {knowledge.relationships.map(({ relationship, direction, otherEntity }) => (
              <li key={relationship.id}>
                {direction === "outgoing" ? "→" : "←"} {relationship.relationType}:{" "}
                <span className="font-medium">{otherEntity?.name ?? "unknown"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Insights (with evidence)</h3>
        {knowledge.insights.length === 0 ? (
          <p className="text-muted-foreground text-sm">No insights yet.</p>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Insights">
            {knowledge.insights.map(({ insight, citedMemories }) => (
              <li key={insight.id} className={card}>
                <span className="text-sm font-medium">{insight.statement}</span>
                <span className="text-muted-foreground text-xs">
                  {Math.round(insight.confidence * 100)}% confidence
                  {insight.evidence ? ` · ${insight.evidence}` : ""}
                </span>
                <span className="text-muted-foreground text-xs">
                  Traceable to: {citedMemories.map((m) => m.content).join("; ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
