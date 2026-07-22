import type { Metadata } from "next";
import { RunDetail } from "@/ui/acquisition/run-detail";
export const metadata: Metadata = { title: "Acquisition Run" };
export default async function Page({ params }: { params: Promise<{ runId: string }> }) {
  return <RunDetail runId={(await params).runId} />;
}
