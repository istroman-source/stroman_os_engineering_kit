import type { Metadata } from "next";
import { PageHeader } from "@/ui/page-header";
import { ProjectsView } from "@/ui/projects/projects-view";

export const metadata: Metadata = { title: "Story Studio" };

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Story Studio"
        description="Start with a video concept. Stroman OS turns your intent into a story and edit plan."
      />
      <ProjectsView />
    </div>
  );
}
