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
  "flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Minimal working projects interface backed by the existing /api/v1/projects
 * contract. Fetches the owner's projects, supports create, and reflects new
 * projects immediately by reloading the authoritative list from the server (so a
 * page refresh shows the same persisted data).
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
      await createProject(trimmed);
      setName("");
      // Reload the authoritative list so a subsequent refresh shows the same data.
      const items = await listProjects();
      setProjects(items);
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
    <div className="flex flex-col gap-6">
      <form onSubmit={onCreate} className="flex gap-2" aria-label="Create project">
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          maxLength={200}
          aria-label="Project name"
        />
        <Button type="submit" disabled={busy || name.trim() === ""}>
          {busy ? "Creating…" : "Create project"}
        </Button>
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
        <div className="border-border bg-card text-muted-foreground rounded-lg border p-8 text-sm">
          No projects yet. Create your first one above.
        </div>
      ) : (
        <ul className="flex flex-col gap-2" aria-label="Projects">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="border-border bg-card hover:border-primary/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
              >
                <span className="text-sm font-medium">{project.name}</span>
                <span className="text-muted-foreground text-xs tracking-wide uppercase">
                  {project.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
