"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/ui/primitives/button";
import { cn } from "@/ui/cn";
import {
  createProject,
  errorStatus,
  friendlyError,
  listProjects,
  type ProjectItem,
} from "@/ui/auth/api-client";
import { getCreativeIntent, type CreativeBrief } from "@/ui/creative/creative-api";

const inputClass =
  "min-h-11 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

interface ResumeDetails {
  readonly projectType: string | null;
  readonly stage: string;
  readonly nextAction: string;
  readonly href: string;
}

function resumeDetails(project: ProjectItem, intent: CreativeBrief | null): ResumeDetails {
  const base = `/projects/${project.id}`;
  if (project.status === "COMPLETED") {
    return {
      projectType: intent?.projectType.trim() || null,
      stage: "REVIEW",
      nextAction: "Review the finished film and its handoff.",
      href: `${base}/review`,
    };
  }
  if (project.status === "ARCHIVED") {
    return {
      projectType: intent?.projectType.trim() || null,
      stage: "ARCHIVED",
      nextAction: "Open the film to restore it when you are ready.",
      href: base,
    };
  }
  if (!intent) {
    return {
      projectType: null,
      stage: "DEVELOPMENT",
      nextAction: "Tell Stroman what you want this film to become.",
      href: `${base}/brief`,
    };
  }
  if (intent.developmentStatus === "PROCESSING") {
    return {
      projectType: intent.projectType.trim() || null,
      stage: "DEVELOPMENT",
      nextAction: "See the film plan Stroman is building from your saved brief.",
      href: `${base}/brief`,
    };
  }
  if (intent.developmentStatus === "FAILED") {
    return {
      projectType: intent.projectType.trim() || null,
      stage: "DEVELOPMENT",
      nextAction: "Retry your saved brief—nothing needs to be entered again.",
      href: `${base}/brief`,
    };
  }

  const stage = intent.planningContext.stage;
  if (stage === "PRE_PRODUCTION") {
    return {
      projectType: intent.projectType.trim() || null,
      stage: "SHOT PLANNING",
      nextAction: "Review the suggested shots and make them shootable.",
      href: `${base}/storyboard`,
    };
  }
  if (stage === "SCOUTING") {
    return {
      projectType: intent.projectType.trim() || null,
      stage: "LOCATION PLANNING",
      nextAction: "Connect the story to the places where you can shoot it.",
      href: `${base}/storyboard`,
    };
  }
  if (stage === "SHOOTING") {
    return {
      projectType: intent.projectType.trim() || null,
      stage: "PRODUCTION",
      nextAction: "Add footage and notes from the shoot.",
      href: `${base}/materials`,
    };
  }
  if (stage === "POST") {
    return {
      projectType: intent.projectType.trim() || null,
      stage: "EDIT",
      nextAction: "Shape the footage and review what the film needs next.",
      href: `${base}/materials`,
    };
  }
  return {
    projectType: intent.projectType.trim() || null,
    stage: "DEVELOPMENT",
    nextAction:
      intent.developmentStatus === "READY"
        ? "Review the film plan and choose what to shape next."
        : "Finish telling Stroman what you want this film to become.",
    href: base,
  };
}

/**
 * Minimal working projects interface backed by the existing /api/v1/projects
 * contract. Fetches the owner's projects, supports create, and reflects new
 * projects and moves a new project directly into its concept-first workspace.
 */
export function ProjectsView() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[] | null>(null);
  const [resumeByProject, setResumeByProject] = useState<Record<string, ResumeDetails>>({});
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  // Initial load. State is set inside the promise callbacks (never synchronously
  // in the effect body), which is the pattern React's rules-of-hooks lint allows.
  useEffect(() => {
    let active = true;
    listProjects()
      .then((items) => {
        if (!active) return;
        setLoadError(null);
        setProjects(items);
        void Promise.all(
          items.map(async (project) => {
            try {
              return [
                project.id,
                resumeDetails(project, await getCreativeIntent(project.id)),
              ] as const;
            } catch (error) {
              if (errorStatus(error) === 401) throw error;
              return [project.id, resumeDetails(project, null)] as const;
            }
          }),
        )
          .then((entries) => {
            if (active) setResumeByProject(Object.fromEntries(entries));
          })
          .catch((error) => {
            if (active && errorStatus(error) === 401) router.replace("/login");
          });
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
  }, [loadAttempt, router]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === "") return;
    setBusy(true);
    setCreateError(null);
    try {
      const project = await createProject(trimmed);
      router.push(`/projects/${project.id}/brief`);
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12">
      <form onSubmit={onCreate} className="flex flex-col gap-5" aria-label="Start a film">
        <div>
          <p className="text-primary text-sm font-semibold tracking-wide">START A FILM</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Tell Stroman what you want to make.
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm">
            Give the film a working title. Next, you’ll describe the idea in your own words.
            Production details can wait.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Working title — you can change it later"
            maxLength={200}
            aria-label="Project working title"
          />
          <Button className="sm:min-w-36" type="submit" disabled={busy || name.trim() === ""}>
            {busy ? "Starting…" : "Start a film"}
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
        <div role="alert" className="border-border bg-card rounded-xl border p-5">
          <p className="text-destructive text-sm">{loadError}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => {
              setProjects(null);
              setLoadError(null);
              setLoadAttempt((attempt) => attempt + 1);
            }}
          >
            Reload projects
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <p className="border-border text-muted-foreground border-t pt-8 text-sm">
          Your films will appear here so you can always return to the exact next step.
        </p>
      ) : (
        <section aria-labelledby="your-projects" className="space-y-3">
          <div>
            <p className="text-primary text-sm font-semibold tracking-wide">CONTINUE A FILM</p>
            <h2 id="your-projects" className="mt-2 text-2xl font-semibold tracking-tight">
              Pick up where you left off.
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Each film shows the one thing that matters next.
            </p>
          </div>
          <ul className="divide-border border-border divide-y border-y" aria-label="Projects">
            {projects.map((project) => {
              const resume = resumeByProject[project.id] ?? resumeDetails(project, null);
              return (
                <li key={project.id} className="py-6 first:pt-5 last:pb-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold">{project.name}</h3>
                      {resume.projectType ? (
                        <p className="text-muted-foreground mt-0.5 text-sm">{resume.projectType}</p>
                      ) : null}
                      <p className="text-primary mt-4 text-xs font-semibold tracking-wider">
                        {resume.stage}
                      </p>
                      <p className="mt-2 text-sm">
                        <span className="font-medium">Next: </span>
                        <span className="text-muted-foreground">{resume.nextAction}</span>
                      </p>
                    </div>
                    <Link
                      href={resume.href}
                      aria-label={`Continue ${project.name}`}
                      className={cn(buttonVariants(), "shrink-0 sm:min-w-28")}
                    >
                      Continue
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
