import { AnalyzeWorkspace } from "@/ui/creative/analyze-workspace";
import { SourceIntake } from "@/ui/projects/source-intake";

// The Creative Blueprint is the project's home. Opening a project shows the
// blueprint immediately (or the analyze form inline when not yet analyzed).
export default async function ProjectHomePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <>
      <SourceIntake projectId={projectId} />
      <AnalyzeWorkspace projectId={projectId} />
    </>
  );
}
