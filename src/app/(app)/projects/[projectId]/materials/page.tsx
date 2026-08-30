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
        <h2 className="text-2xl font-semibold tracking-tight">Bring in your footage</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Add footage or a transcript. Stroman finds the moments you can use, keeps source facts
          separate from creative ideas, and carries them into your edit.
        </p>
      </header>
      <SourceIntake projectId={projectId} />
      <AutomaticAnalysis projectId={projectId} />
      <EditEngine projectId={projectId} />
      <PromptHandoff projectId={projectId} />
    </div>
  );
}
