import type { Metadata } from "next";
import { PageHeader } from "@/ui/page-header";
import { ProjectsView } from "@/ui/projects/projects-view";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Your films"
        description="Start with an idea or continue from the next clear step. Stroman will guide you forward."
      />
      <ProjectsView />
    </div>
  );
}
