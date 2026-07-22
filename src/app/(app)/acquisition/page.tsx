import type { Metadata } from "next";
import { SourcesWorkbench } from "@/ui/acquisition/sources-workbench";
export const metadata: Metadata = { title: "Knowledge Acquisition" };
export default function Page() {
  return <SourcesWorkbench />;
}
