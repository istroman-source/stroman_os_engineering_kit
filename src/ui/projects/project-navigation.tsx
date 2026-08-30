"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { errorStatus, friendlyError, getProject, type ProjectItem } from "@/ui/auth/api-client";

const sections = [
  { suffix: "", label: "Idea" },
  { suffix: "/storyboard", label: "Plan shots" },
  { suffix: "/materials", label: "Footage & notes" },
  { suffix: "/decisions", label: "Choices" },
] as const;

const statusLabels: Record<ProjectItem["status"], string> = {
  DRAFT: "Draft",
  ACTIVE: "In progress",
  COMPLETED: "Complete",
  ARCHIVED: "Archived",
};

const nextActions: Record<ProjectItem["status"], string> = {
  DRAFT: "Start with the idea",
  ACTIVE: "Continue making the film",
  COMPLETED: "Review the finished work",
  ARCHIVED: "Archived project",
};

export function ProjectNavigation({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProject(projectId)
      .then((item) => {
        if (active) setProject(item);
      })
      .catch((caught) => {
        if (!active) return;
        if (errorStatus(caught) === 401) router.replace("/login");
        else setError(friendlyError(caught));
      });
    return () => {
      active = false;
    };
  }, [projectId, router]);

  const base = `/projects/${projectId}`;
  const currentSuffix = [...sections]
    .reverse()
    .find(({ suffix }) =>
      suffix === "" ? pathname === base : pathname.startsWith(`${base}${suffix}`),
    )?.suffix;

  return (
    <header className="mb-8 space-y-5">
      <nav
        aria-label="Breadcrumb"
        className="text-muted-foreground flex items-center gap-2 text-sm"
      >
        <Link className="hover:text-foreground" href="/projects">
          Projects
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground" aria-current="page">
          {project?.name ?? "Project"}
        </span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {project?.name ?? "Loading project…"}
          </h1>
          {project ? (
            <p className="text-muted-foreground mt-1 text-sm">
              {statusLabels[project.status]} · {nextActions[project.status]}
            </p>
          ) : null}
        </div>
        <Link
          href="/locations"
          className="border-border bg-card hover:border-primary/50 focus-visible:ring-ring inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          Rooms
        </Link>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <nav aria-label="Project" className="border-border flex gap-1 overflow-x-auto border-b">
        {sections.map(({ suffix, label }) => {
          const href = `${base}${suffix}`;
          const active = currentSuffix === suffix;
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`focus-visible:ring-ring relative inline-flex min-h-11 shrink-0 items-center px-3 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none ${
                active
                  ? "text-foreground after:bg-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
