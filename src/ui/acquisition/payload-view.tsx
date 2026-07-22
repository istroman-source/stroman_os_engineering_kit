import type { ObservationPayload } from "./acquisition-api";
export function PayloadView({ payload }: { payload: ObservationPayload }) {
  return (
    <pre className="bg-muted overflow-auto rounded-md p-3 text-xs">
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
}
