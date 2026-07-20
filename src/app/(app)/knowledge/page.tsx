import type { Metadata } from "next";
import { KnowledgeWorkspace } from "@/ui/memory/knowledge-workspace";

export const metadata: Metadata = { title: "Creative Memory" };

export default function KnowledgePage() {
  return <KnowledgeWorkspace />;
}
