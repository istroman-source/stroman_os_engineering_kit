import type { Metadata } from "next";
import { PageHeader } from "@/ui/page-header";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Where creative projects will live. The projects workflow arrives in a later build step."
      />
      <div className="border-border bg-card text-muted-foreground rounded-lg border p-8 text-sm">
        No projects yet.
      </div>
    </div>
  );
}
