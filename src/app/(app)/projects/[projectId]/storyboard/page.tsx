import Link from "next/link";
import { AnalyzeWorkspace } from "@/ui/creative/analyze-workspace";

export default async function ProjectStoryboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <div className="space-y-6">
      <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Storyboard in a real room</h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Compose the frame inside this project’s room. Need a different room? Open Locations to
            prepare or review it first.
          </p>
        </div>
        <Link
          href={`/locations?returnTo=${encodeURIComponent(`/projects/${projectId}/storyboard`)}`}
          className="text-primary focus-visible:ring-ring inline-flex min-h-11 shrink-0 items-center text-sm font-semibold underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Open locations
        </Link>
      </div>
      <AnalyzeWorkspace projectId={projectId} focus="storyboard" />
    </div>
  );
}
