import { ProjectWorkspace } from "@/ui/projects/project-workspace";

// Secondary "decision log" — the internal reasoning layer, reached from the
// Blueprint. Not the primary project experience.
export default async function ProjectDecisionsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectWorkspace projectId={projectId} />;
}
