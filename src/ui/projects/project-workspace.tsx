"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { errorStatus, friendlyError, getProject, type ProjectItem } from "@/ui/auth/api-client";
import { type Decision, listDecisions } from "@/ui/decisions/decisions-api";
import { NewDecisionForm } from "@/ui/decisions/new-decision-form";

/**
 * The project workspace: a decision operating system, not a task board. It leads
 * with the decisions in play — each one framed as a question — so the first thing
 * you see is "what decision am I making?".
 */
export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [decisions, setDecisions] = useState<Decision[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getProject(projectId), listDecisions(projectId)])
      .then(([loadedProject, loadedDecisions]) => {
        if (!active) return;
        setProject(loadedProject);
        setDecisions(loadedDecisions);
      })
      .catch((err) => {
        if (!active) return;
        if (errorStatus(err) === 401) {
          router.replace("/login");
          return;
        }
        if (errorStatus(err) === 404) {
          setNotFound(true);
          return;
        }
        setError(friendlyError(err));
      });
    return () => {
      active = false;
    };
  }, [projectId, router]);

  if (notFound) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm">This project doesn’t exist or isn’t yours.</p>
        <Link className="text-primary text-sm underline-offset-4 hover:underline" href="/projects">
          Back to projects
        </Link>
      </div>
    );
  }
  if (error) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error}
      </p>
    );
  }
  if (!project || decisions === null) {
    return <p className="text-muted-foreground text-sm">Loading workspace…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <Link
            className="text-muted-foreground text-xs underline-offset-4 hover:underline"
            href={`/projects/${projectId}`}
          >
            ← Blueprint
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground text-sm">Decision log</p>
        </div>
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          {project.status}
        </span>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Frame a new decision</h2>
        <NewDecisionForm
          projectId={projectId}
          onCreated={(decision) => setDecisions((current) => [decision, ...(current ?? [])])}
          onUnauthorized={() => router.replace("/login")}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Decisions</h2>
        {decisions.length === 0 ? (
          <div className="border-border bg-card text-muted-foreground rounded-lg border p-8 text-sm">
            No decisions yet. Frame the first one above.
          </div>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Decisions">
            {decisions.map((decision) => (
              <li key={decision.id}>
                <Link
                  href={`/projects/${projectId}/decisions/${decision.id}`}
                  className="border-border bg-card hover:border-primary/50 flex flex-col gap-1 rounded-lg border p-4 transition-colors"
                >
                  <span className="text-sm font-medium">{decision.question}</span>
                  <span className="text-muted-foreground flex gap-3 text-xs">
                    <span className="tracking-wide uppercase">{decision.status}</span>
                    <span>{decision.options.length} options</span>
                    {decision.advisory ? <span>AI advised</span> : null}
                    {decision.status === "DECIDED" ? <span>· decided</span> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
