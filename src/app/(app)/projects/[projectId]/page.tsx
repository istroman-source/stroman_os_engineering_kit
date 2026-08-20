import { AnalyzeWorkspace } from "@/ui/creative/analyze-workspace";
import { SourceIntake } from "@/ui/projects/source-intake";
import { AutomaticAnalysis } from "@/ui/projects/automatic-analysis";
import { EditEngine } from "@/ui/projects/edit-engine";
import { PromptHandoff } from "@/ui/projects/prompt-handoff";

// The Story → Plan → Edit workspace is the project's home. Opening a project
// shows saved filmmaking state (or the intent form when not yet developed).
export default async function ProjectHomePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <>
      <AnalyzeWorkspace projectId={projectId} />
      <SourceIntake projectId={projectId} />
      <AutomaticAnalysis projectId={projectId} />
      <EditEngine projectId={projectId} />
      <PromptHandoff projectId={projectId} />
    </>
  );
}
