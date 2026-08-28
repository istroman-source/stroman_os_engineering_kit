import { AutomaticAnalysis } from "@/ui/projects/automatic-analysis";
import { EditEngine } from "@/ui/projects/edit-engine";
import { PromptHandoff } from "@/ui/projects/prompt-handoff";
import { SourceIntake } from "@/ui/projects/source-intake";

export default async function ProjectMaterialsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <div>
      <header className="mb-6 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">Materials and quotes</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Bring in footage or transcripts, then analyze them for exact quotes, visible evidence, and
          editorial possibilities. Stroman keeps observations separate from interpretation.
        </p>
      </header>
      <SourceIntake projectId={projectId} />
      <AutomaticAnalysis projectId={projectId} />
      <EditEngine projectId={projectId} />
      <PromptHandoff projectId={projectId} />
    </div>
  );
}
