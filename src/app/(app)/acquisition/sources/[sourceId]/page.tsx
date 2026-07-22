import type { Metadata } from "next";
import { SourceDetail } from "@/ui/acquisition/source-detail";
export const metadata: Metadata = { title: "Knowledge Source" };
export default async function Page({ params }: { params: Promise<{ sourceId: string }> }) {
  return <SourceDetail sourceId={(await params).sourceId} />;
}
