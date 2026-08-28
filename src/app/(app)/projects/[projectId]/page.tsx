import { AnalyzeWorkspace } from "@/ui/creative/analyze-workspace";

// A project's calm starting point: intent, story spine, and deeper reasoning on demand.
export default async function ProjectHomePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <AnalyzeWorkspace projectId={projectId} focus="story" />;
}
