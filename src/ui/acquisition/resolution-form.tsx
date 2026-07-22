import { useState } from "react";
import { Button } from "@/ui/primitives/button";

export function ResolutionForm({
  kind,
  onSubmit,
}: {
  kind: string;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  if (kind === "ENTITY")
    return (
      <Button size="sm" onClick={() => onSubmit({ kind: "ENTITY" })}>
        Materialize entity
      </Button>
    );
  const labels =
    kind === "MEMORY"
      ? ["Entity ID"]
      : kind === "INSIGHT"
        ? ["Memory IDs (comma separated)"]
        : ["From entity ID", "To entity ID"];
  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!a.trim() || (labels.length === 2 && !b.trim())) return;
        const resolution =
          kind === "MEMORY"
            ? { kind, entityId: a.trim() }
            : kind === "INSIGHT"
              ? {
                  kind,
                  memoryIds: a
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                }
              : { kind, fromEntityId: a.trim(), toEntityId: b.trim() };
        onSubmit(resolution);
      }}
    >
      {labels.map((label, i) => (
        <label key={label} className="grid gap-1 text-sm">
          <span>{label}</span>
          <input
            required
            className="rounded-md border px-3 py-2"
            value={i ? b : a}
            onChange={(e) => (i ? setB(e.target.value) : setA(e.target.value))}
          />
        </label>
      ))}
      <Button size="sm" type="submit">
        Materialize {kind.toLowerCase()}
      </Button>
    </form>
  );
}
