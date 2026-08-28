"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/primitives/button";
import {
  createProject,
  errorStatus,
  friendlyError,
  listProjects,
  type ProjectItem,
} from "@/ui/auth/api-client";

const inputClass =
  "min-h-11 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

const statusLabels: Record<ProjectItem["status"], string> = {
  DRAFT: "Draft",
  ACTIVE: "In progress",
  COMPLETED: "Complete",
  ARCHIVED: "Archived",
};

/**
 * Minimal working projects interface backed by the existing /api/v1/projects
 * contract. Fetches the owner's projects, supports create, and reflects new
 * projects and moves a new project directly into its concept-first workspace.
 */
export function ProjectsView() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[] | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Initial load. State is set inside the promise callbacks (never synchronously
  // in the effect body), which is the pattern React's rules-of-hooks lint allows.
  useEffect(() => {
    let active = true;
    listProjects()
      .then((items) => {
        if (!active) return;
        setLoadError(null);
        setProjects(items);
      })
      .catch((err) => {
        if (!active) return;
        if (errorStatus(err) === 401) router.replace("/login");
        else {
          setProjects([]);
          setLoadError(friendlyError(err));
        }
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === "") return;
    setBusy(true);
    setCreateError(null);
    try {
      const project = await createProject(trimmed);
      router.push(`/projects/${project.id}`);
    } catch (err) {
      if (errorStatus(err) === 401) {
        router.replace("/login");
        return;
      }
      setCreateError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={onCreate}
        className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5 shadow-sm sm:p-6"
        aria-label="Create project"
      >
        <div>
          <h2 className="text-lg font-semibold">Create a project</h2>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            Give the film a working title. You can shape its story, storyboard, and materials next.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Film or video title"
            maxLength={200}
            aria-label="Project working title"
          />
          <Button className="sm:min-w-36" type="submit" disabled={busy || name.trim() === ""}>
            {busy ? "Creating…" : "Create project"}
          </Button>
        </div>
      </form>

      {createError ? (
        <p role="alert" className="text-destructive text-sm">
          {createError}
        </p>
      ) : null}

      {projects === null ? (
        <p className="text-muted-foreground text-sm">Loading projects…</p>
      ) : loadError ? (
        <p role="alert" className="text-destructive text-sm">
          {loadError}
        </p>
      ) : projects.length === 0 ? (
        <div className="border-border bg-card rounded-2xl border px-6 py-12 text-center">
          <h2 className="font-semibold">No projects yet</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            Create your first project above. Stroman will guide you from intent to a shootable plan.
          </p>
        </div>
      ) : (
        <section aria-labelledby="your-projects" className="space-y-3">
          <div>
            <h2 id="your-projects" className="text-lg font-semibold">
              Your projects
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Open a project to continue its story or storyboard.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2" aria-label="Projects">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="border-border bg-card hover:border-primary/50 focus-visible:ring-ring flex min-h-28 flex-col justify-between rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="font-semibold">{project.name}</span>
                  <span className="text-muted-foreground mt-5 text-sm">
                    {statusLabels[project.status] ?? project.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
