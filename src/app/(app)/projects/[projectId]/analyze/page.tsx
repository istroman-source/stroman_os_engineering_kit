import { redirect } from "next/navigation";

// The Blueprint (analyze experience) now lives at the project home; keep this
// path working by redirecting to it.
export default async function AnalyzeRedirectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/projects/${projectId}`);
}
