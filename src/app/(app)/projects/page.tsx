import type { Metadata } from "next";
import { PageHeader } from "@/ui/page-header";
import { ProjectsView } from "@/ui/projects/projects-view";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Shape a story, plan real frames, and keep the material for each film together."
      />
      <ProjectsView />
    </div>
  );
}
