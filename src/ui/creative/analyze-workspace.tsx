"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { errorStatus, friendlyError } from "@/ui/auth/api-client";
import { AnalyzeForm } from "./analyze-form";
import { BlueprintView } from "./blueprint-view";
import { type Analysis, type AnalyzeFields, analyzeProject, getAnalysis } from "./creative-api";

type Mode = "loading" | "form" | "blueprint";

/**
 * "Analyze Project": the creator enters context and Stroman OS returns a Creative
 * Blueprint. If the project was already analyzed, the blueprint loads immediately
 * (with a Re-analyze path back to the form, prefilled).
 */
export function AnalyzeWorkspace({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("loading");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAnalysis(projectId)
      .then((loaded) => {
        if (!active) return;
        setAnalysis(loaded);
        setMode("blueprint");
      })
      .catch((err) => {
        if (!active) return;
        if (errorStatus(err) === 401) {
          router.replace("/login");
          return;
        }
        // 404 = not analyzed yet → show the form. Anything else → show the form too,
        // but surface the message.
        if (errorStatus(err) !== 404) setError(friendlyError(err));
        setMode("form");
      });
    return () => {
      active = false;
    };
  }, [projectId, router]);

  async function onAnalyze(fields: AnalyzeFields) {
    setBusy(true);
    setError(null);
    try {
      const result = await analyzeProject(projectId, fields);
      setAnalysis(result);
      setMode("blueprint");
    } catch (err) {
      if (errorStatus(err) === 401) {
        router.replace("/login");
        return;
      }
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  if (mode === "loading") {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  const nav = (
    <nav className="text-muted-foreground flex gap-4 text-xs" aria-label="Project">
      <Link className="underline-offset-4 hover:underline" href="/projects">
        ← Projects
      </Link>
      <Link
        className="underline-offset-4 hover:underline"
        href={`/projects/${projectId}/decisions`}
      >
        Decision log
      </Link>
    </nav>
  );

  if (mode === "blueprint" && analysis) {
    return (
      <div className="flex flex-col gap-6">
        {nav}
        <BlueprintView analysis={analysis} onReanalyze={() => setMode("form")} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {nav}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Analyze Project</h1>
        <p className="text-muted-foreground text-sm">
          Give Stroman OS the context and it will build your Creative Blueprint before you edit.
        </p>
      </header>
      <AnalyzeForm initial={analysis?.brief} busy={busy} error={error} onSubmit={onAnalyze} />
    </div>
  );
}
