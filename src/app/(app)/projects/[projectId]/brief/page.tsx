import { AnalyzeWorkspace } from "@/ui/creative/analyze-workspace";

/** Guided first step for a new or unfinished film. */
export default async function ProjectBriefPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <AnalyzeWorkspace projectId={projectId} focus="story" />;
}
