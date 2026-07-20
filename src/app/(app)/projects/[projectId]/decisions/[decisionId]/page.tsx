import { DecisionDetail } from "@/ui/decisions/decision-detail";

export default async function DecisionDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; decisionId: string }>;
}) {
  const { projectId, decisionId } = await params;
  return <DecisionDetail projectId={projectId} decisionId={decisionId} />;
}
