import type { ReactNode } from "react";
import { ProjectNavigation } from "@/ui/projects/project-navigation";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <div>
      <ProjectNavigation projectId={projectId} />
      {children}
    </div>
  );
}
