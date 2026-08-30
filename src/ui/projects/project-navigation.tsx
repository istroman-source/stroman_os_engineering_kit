"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import {
  errorStatus,
  friendlyError,
  getProject,
  renameProject,
  updateProjectLifecycle,
  type ProjectLifecycleAction,
  type ProjectItem,
} from "@/ui/auth/api-client";
import { Button } from "@/ui/primitives/button";

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
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    getProject(projectId)
      .then((item) => {
        if (active) {
          setMissing(false);
          setError(null);
          setProject(item);
          setName(item.name);
        }
      })
      .catch((caught) => {
        if (!active) return;
        if (errorStatus(caught) === 401) router.replace("/login");
        else if (errorStatus(caught) === 404) setMissing(true);
        else setError(friendlyError(caught));
      });
    return () => {
      active = false;
    };
  }, [loadAttempt, projectId, router]);

  const base = `/projects/${projectId}`;
  const currentSuffix = [...sections]
    .reverse()
    .find(({ suffix }) =>
      suffix === "" ? pathname === base : pathname.startsWith(`${base}${suffix}`),
    )?.suffix;

  async function onRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!project?.concurrencyToken || name.trim() === "" || name.trim() === project.name) return;
    setSavingName(true);
    setError(null);
    try {
      const updated = await renameProject(projectId, name.trim(), project.concurrencyToken);
      setProject(updated);
      setName(updated.name);
    } catch (caught) {
      if (errorStatus(caught) === 401) router.replace("/login");
      else if (errorStatus(caught) === 409) {
        setError("This project changed elsewhere. Reload it before saving the new title.");
      } else setError(friendlyError(caught));
    } finally {
      setSavingName(false);
    }
  }

  async function onLifecycle(action: ProjectLifecycleAction) {
    if (!project?.concurrencyToken) return;
    setChangingStatus(true);
    setError(null);
    try {
      const updated = await updateProjectLifecycle(projectId, action, project.concurrencyToken);
      setProject(updated);
    } catch (caught) {
      if (errorStatus(caught) === 401) router.replace("/login");
      else if (errorStatus(caught) === 409) {
        setError("This project changed elsewhere. Reload it before changing its status.");
      } else setError(friendlyError(caught));
    } finally {
      setChangingStatus(false);
    }
  }

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

      {missing ? (
        <div className="border-border bg-card rounded-xl border p-4" role="alert">
          <p className="text-sm font-medium">This project doesn’t exist or isn’t yours.</p>
          <Link
            className="text-primary mt-2 inline-block text-sm underline-offset-4 hover:underline"
            href="/projects"
          >
            Back to projects
          </Link>
        </div>
      ) : error ? (
        <div className="border-border bg-card rounded-xl border p-4" role="alert">
          <p className="text-destructive text-sm">{error}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => {
              setError(null);
              setLoadAttempt((attempt) => attempt + 1);
            }}
          >
            Reload project
          </Button>
        </div>
      ) : null}

      {project ? (
        <details className="border-border bg-card rounded-xl border px-4 py-3">
          <summary className="focus-visible:ring-ring min-h-11 cursor-pointer content-center text-sm font-medium focus-visible:ring-2 focus-visible:outline-none">
            Project settings
          </summary>
          <form onSubmit={onRename} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm">
              <span className="mb-1 block font-medium">Working title</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={200}
                className="border-border bg-background focus-visible:ring-ring min-h-11 w-full rounded-lg border px-3 text-base focus-visible:ring-2 focus-visible:outline-none"
              />
            </label>
            <Button
              type="submit"
              disabled={
                savingName ||
                !project.concurrencyToken ||
                name.trim() === "" ||
                name.trim() === project.name
              }
            >
              {savingName ? "Saving…" : "Save title"}
            </Button>
          </form>
          <div className="border-border mt-4 border-t pt-4">
            <p className="text-sm font-medium">Project status</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {project.status === "DRAFT"
                ? "Start when the working idea is ready to move forward."
                : project.status === "ACTIVE"
                  ? "Mark the project complete when the current film is handed off, or archive it for later."
                  : project.status === "COMPLETED"
                    ? "Reopen the project if the film needs another pass, or archive it when it is no longer active."
                    : "Restore this project to continue working without losing its history."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.status === "DRAFT" ? (
                <Button
                  type="button"
                  disabled={changingStatus}
                  onClick={() => void onLifecycle("activate")}
                >
                  Start project
                </Button>
              ) : null}
              {project.status === "ACTIVE" ? (
                <Button
                  type="button"
                  disabled={changingStatus}
                  onClick={() => void onLifecycle("complete")}
                >
                  Mark complete
                </Button>
              ) : null}
              {project.status === "COMPLETED" ? (
                <Button
                  type="button"
                  disabled={changingStatus}
                  onClick={() => void onLifecycle("reopen")}
                >
                  Reopen project
                </Button>
              ) : null}
              {project.status === "ARCHIVED" ? (
                <Button
                  type="button"
                  disabled={changingStatus}
                  onClick={() => void onLifecycle("reopen")}
                >
                  Restore project
                </Button>
              ) : null}
              {project.status !== "DRAFT" && project.status !== "ARCHIVED" ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={changingStatus}
                  onClick={() => void onLifecycle("archive")}
                >
                  Archive project
                </Button>
              ) : null}
            </div>
          </div>
        </details>
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
