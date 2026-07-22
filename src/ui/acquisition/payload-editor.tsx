import type { ObservationPayload } from "./acquisition-api";
export function PayloadEditor({
  value,
  onChange,
}: {
  value: ObservationPayload;
  onChange: (v: ObservationPayload) => void;
}) {
  const fields = Object.entries(value).filter(([k]) => k !== "kind");
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">Edited {value.kind.toLowerCase()} payload</legend>
      {fields.map(([key, val]) => (
        <label key={key} className="grid gap-1 text-sm">
          <span>{key}</span>
          <input
            className="rounded-md border px-3 py-2"
            value={String(val)}
            onChange={(e) => onChange({ ...value, [key]: e.target.value } as ObservationPayload)}
          />
        </label>
      ))}
    </fieldset>
  );
}
