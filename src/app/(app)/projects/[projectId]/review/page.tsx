import { ProjectReview } from "@/ui/projects/project-review";

export default async function ProjectReviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectReview projectId={projectId} />;
}
