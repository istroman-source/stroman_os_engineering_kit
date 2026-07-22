export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium"
      aria-label={`Status: ${status}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
